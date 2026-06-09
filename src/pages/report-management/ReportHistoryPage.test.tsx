import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { __resetGeneratedReportStorageCache, saveGeneratedReports } from '@/utils/generatedReportStorage'
import type { GeneratedReport } from '@/models/generatedReportModel'
import ReportHistoryPage from './ReportHistoryPage'

describe('ReportHistoryPage', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetGeneratedReportStorageCache()
  })

  it('shows empty state when no generated reports exist', () => {
    render(
      <MemoryRouter>
        <ReportHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('暂无历史报告')).toBeInTheDocument()
    expect(screen.getByText('生成的报告将在此处展示')).toBeInTheDocument()
  })

  it('renders generated report list with plan name, template, version, date and trigger type', () => {
    const mockReports: GeneratedReport[] = [
      {
        id: 'gen-001',
        planId: 'plan-001',
        planName: '核心指标日报',
        templateId: 'tmpl-001',
        templateName: '标准日报模板',
        version: 'v1',
        generatedAt: '2024-06-01T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'manual',
        sections: [],
      },
      {
        id: 'gen-002',
        planId: 'plan-002',
        planName: '周报汇总',
        templateId: 'tmpl-002',
        templateName: '周报模板',
        version: 'v2',
        generatedAt: '2024-06-02T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'auto',
        sections: [],
      },
    ]
    saveGeneratedReports(mockReports)

    render(
      <MemoryRouter>
        <ReportHistoryPage />
      </MemoryRouter>,
    )

    const row1 = screen.getByTestId('report-history-row-gen-001')
    expect(row1).toHaveTextContent('核心指标日报')
    expect(row1).toHaveTextContent('标准日报模板')
    expect(row1).toHaveTextContent('v1')
    expect(row1).toHaveTextContent('手动')

    const row2 = screen.getByTestId('report-history-row-gen-002')
    expect(row2).toHaveTextContent('周报汇总')
    expect(row2).toHaveTextContent('周报模板')
    expect(row2).toHaveTextContent('v2')
    expect(row2).toHaveTextContent('自动')
  })

  it('navigates to report detail when clicking a report row', async () => {
    const user = userEvent.setup()
    const mockReports: GeneratedReport[] = [
      {
        id: 'gen-001',
        planId: 'plan-001',
        planName: '核心指标日报',
        templateId: 'tmpl-001',
        templateName: '标准日报模板',
        version: 'v1',
        generatedAt: '2024-06-01T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'manual',
        sections: [],
      },
    ]
    saveGeneratedReports(mockReports)

    render(
      <MemoryRouter initialEntries={['/reports/history']}>
        <Routes>
          <Route path="/reports/history" element={<ReportHistoryPage />} />
          <Route path="/reports/:reportId" element={<div data-testid="report-detail-page">Report Detail</div>} />
        </Routes>
      </MemoryRouter>,
    )

    const row = screen.getByTestId('report-history-row-gen-001')
    await user.click(row)

    expect(screen.getByTestId('report-detail-page')).toBeInTheDocument()
  })

  it('filters reports by plan when selecting a plan from dropdown', async () => {
    const user = userEvent.setup()
    const mockReports: GeneratedReport[] = [
      {
        id: 'gen-001',
        planId: 'plan-001',
        planName: '核心指标日报',
        templateId: 'tmpl-001',
        templateName: '标准日报模板',
        version: 'v1',
        generatedAt: '2024-06-01T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'manual',
        sections: [],
      },
      {
        id: 'gen-002',
        planId: 'plan-001',
        planName: '核心指标日报',
        templateId: 'tmpl-001',
        templateName: '标准日报模板',
        version: 'v2',
        generatedAt: '2024-06-02T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'auto',
        sections: [],
      },
      {
        id: 'gen-003',
        planId: 'plan-002',
        planName: '周报汇总',
        templateId: 'tmpl-002',
        templateName: '周报模板',
        version: 'v1',
        generatedAt: '2024-06-03T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'manual',
        sections: [],
      },
    ]
    saveGeneratedReports(mockReports)

    render(
      <MemoryRouter>
        <ReportHistoryPage />
      </MemoryRouter>,
    )

    // All reports visible initially
    expect(screen.getByTestId('report-history-row-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-row-gen-002')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-row-gen-003')).toBeInTheDocument()

    // Filter by plan-001
    const filterSelect = screen.getByTestId('report-history-plan-filter')
    await user.selectOptions(filterSelect, 'plan-001')

    expect(screen.getByTestId('report-history-row-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-row-gen-002')).toBeInTheDocument()
    expect(screen.queryByTestId('report-history-row-gen-003')).not.toBeInTheDocument()

    // Filter by all
    await user.selectOptions(filterSelect, 'all')

    expect(screen.getByTestId('report-history-row-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-row-gen-002')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-row-gen-003')).toBeInTheDocument()
  })
})
