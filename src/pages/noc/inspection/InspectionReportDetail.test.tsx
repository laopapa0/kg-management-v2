import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InspectionReportDetail from './InspectionReportDetail';
import {
  mockInspectionReports,
  mockInspectionExecutions,
  mockInspectionPlans,
  mockAnomalyItems,
  mockIndicatorTrends,
} from './mockData';

// Mock llmService
vi.mock('@/services/llmService', () => ({
  generateSuggestion: vi.fn(() =>
    Promise.resolve({ source: 'knowledge' as const, content: '建议内容' })
  ),
}));

describe('InspectionReportDetail — business feedback', () => {
  const renderDetail = (report = mockInspectionReports[0], anomalies = mockAnomalyItems.slice(0, 2)) => {
    render(
      <InspectionReportDetail
        report={report}
        execution={mockInspectionExecutions[0]}
        plan={mockInspectionPlans[0]}
        anomalies={anomalies}
        trends={mockIndicatorTrends}
        lineage={null}
        open={true}
        onClose={() => {}}
      />
    );
  };

  it('shows waiting for feedback when no evaluations', async () => {
    renderDetail(mockInspectionReports[0], mockAnomalyItems.slice(0, 2));
    // report-1 anomalies have no evaluation
    expect(screen.getByText('业务部门反馈')).toBeInTheDocument();
    expect(screen.getByText('等待业务部门反馈')).toBeInTheDocument();
  });

  it('shows feedback table when evaluations exist', async () => {
    // report-5 with anom-4 which has evaluation
    renderDetail(mockInspectionReports[4], [mockAnomalyItems[3]]);
    expect(screen.getByText('业务部门反馈')).toBeInTheDocument();
    // 宽带续费率出现在两个表格中，用 getAllByText
    expect(screen.getAllByText('宽带续费率').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('非误报')).toBeInTheDocument();
    expect(screen.getByText('季节性波动，非真实异常')).toBeInTheDocument();
  });

  it('shows 误报 tag for false positive', async () => {
    const anomalyWithFalsePositive = {
      ...mockAnomalyItems[3],
      evaluation: { isFalsePositive: true, comment: '确认误报' },
    };
    renderDetail(mockInspectionReports[4], [anomalyWithFalsePositive]);
    expect(screen.getByText('误报')).toBeInTheDocument();
  });

  it('shows em dash when no comment', async () => {
    const anomalyNoComment = {
      ...mockAnomalyItems[3],
      evaluation: { isFalsePositive: false },
    };
    renderDetail(mockInspectionReports[4], [anomalyNoComment]);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows push button with correct label', async () => {
    renderDetail();
    expect(screen.getByRole('button', { name: '推送报告至业务部门' })).toBeInTheDocument();
  });
});
