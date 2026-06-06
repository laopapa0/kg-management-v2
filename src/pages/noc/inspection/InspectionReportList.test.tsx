import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InspectionReportList from './InspectionReportList';
import { mockInspectionReports, mockInspectionExecutions, mockInspectionPlans } from './mockData';

describe('InspectionReportList — business review sync', () => {
  const renderList = (reports = mockInspectionReports) => {
    render(
      <InspectionReportList
        reports={reports}
        executions={mockInspectionExecutions}
        plans={mockInspectionPlans}
        onViewDetail={() => {}}
        onArchive={() => {}}
      />
    );
  };

  it('shows business review badge for reports with anomalies', () => {
    renderList();
    // report-1 and report-3 both have pending status
    expect(screen.getAllByText('待评价').length).toBe(2);
  });

  it('shows review progress for reports with anomalies', () => {
    renderList();
    // report-1: evaluatedCount=0, totalCount=2
    expect(screen.getByText(/0\/2/)).toBeInTheDocument();
  });

  it('does not show business review badge for reports with 0 anomalies', () => {
    renderList();
    // report-2 has 0 anomalies, no businessReview field
    const reviewBadges = screen.queryAllByText(/待评价|评价中|已反馈/);
    // Only report-1, report-3, report-5 have anomalies (3 reports)
    expect(reviewBadges.length).toBe(3);
  });

  it('shows "已反馈" badge for submitted reviews', () => {
    renderList();
    // report-5 has submitted status
    expect(screen.getByText('已反馈')).toBeInTheDocument();
  });

  it('archived reports have view detail button', () => {
    renderList();
    // Switch to archived view
    const archivedBtn = screen.getByRole('button', { name: '历史归档' });
    archivedBtn.click();

    // report-5 is resolved (archived), should have view detail button
    const viewButtons = screen.getAllByRole('button', { name: /查看详情/ });
    expect(viewButtons.length).toBeGreaterThanOrEqual(1);
  });
});
