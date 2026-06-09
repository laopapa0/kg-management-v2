import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    vi.restoreAllMocks()
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

  it('renders DataTable with plan name, version, template, date and trigger type', () => {
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

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThanOrEqual(3) // header + 2 data rows

    // Sorted by generatedAt desc: gen-002 (2024-06-02) first, then gen-001 (2024-06-01)
    // Row 1 (auto report - latest)
    expect(rows[1]).toHaveTextContent('周报汇总 v2')
    expect(rows[1]).toHaveTextContent('周报模板')
    expect(rows[1]).toHaveTextContent('自动')

    // Row 2 (manual report)
    expect(rows[2]).toHaveTextContent('核心指标日报 v1')
    expect(rows[2]).toHaveTextContent('标准日报模板')
    expect(rows[2]).toHaveTextContent('手动')
  })

  it('sorts reports by generatedAt in descending order', () => {
    const mockReports: GeneratedReport[] = [
      {
        id: 'gen-001',
        planId: 'plan-001',
        planName: '早期报告',
        templateId: 'tmpl-001',
        templateName: '模板A',
        version: 'v1',
        generatedAt: '2024-06-01T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'manual',
        sections: [],
      },
      {
        id: 'gen-002',
        planId: 'plan-001',
        planName: '最新报告',
        templateId: 'tmpl-001',
        templateName: '模板A',
        version: 'v2',
        generatedAt: '2024-06-03T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'auto',
        sections: [],
      },
      {
        id: 'gen-003',
        planId: 'plan-001',
        planName: '中期报告',
        templateId: 'tmpl-001',
        templateName: '模板A',
        version: 'v3',
        generatedAt: '2024-06-02T08:00:00.000Z',
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

    // DataTable rows should be in tbody
    const rows = screen.getAllByRole('row')
    // rows[0] is header, rows[1+] are data
    expect(rows.length).toBeGreaterThanOrEqual(4)
    expect(rows[1]).toHaveTextContent('最新报告')
    expect(rows[2]).toHaveTextContent('中期报告')
    expect(rows[3]).toHaveTextContent('早期报告')
  })

  it('navigates to report detail when clicking online detail button', async () => {
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

    const detailButton = screen.getByTestId('online-detail-gen-001')
    await user.click(detailButton)

    expect(screen.getByTestId('report-detail-page')).toBeInTheDocument()
  })

  it('opens docs/report.html in new window when clicking view report button', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

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
      <MemoryRouter>
        <ReportHistoryPage />
      </MemoryRouter>,
    )

    const viewButton = screen.getByTestId('view-report-gen-001')
    await user.click(viewButton)

    expect(openSpy).toHaveBeenCalledWith('docs/report.html', '_blank')
  })

  it('filters reports by plan when clicking plan filter buttons', async () => {
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
    expect(screen.getByText('核心指标日报 v1')).toBeInTheDocument()
    expect(screen.getByText('周报汇总 v1')).toBeInTheDocument()

    // Filter by plan-001
    const planButton = screen.getByRole('button', { name: '核心指标日报' })
    await user.click(planButton)

    expect(screen.getByText('核心指标日报 v1')).toBeInTheDocument()
    expect(screen.getByText('核心指标日报 v2')).toBeInTheDocument()
    expect(screen.queryByText('周报汇总 v1')).not.toBeInTheDocument()

    // Filter by all
    const allButtons = screen.getAllByRole('button', { name: '全部' })
    await user.click(allButtons[0])

    expect(screen.getByText('核心指标日报 v1')).toBeInTheDocument()
    expect(screen.getByText('周报汇总 v1')).toBeInTheDocument()
  })

  it('filters reports by trigger type when clicking trigger filter buttons', async () => {
    const user = userEvent.setup()
    const mockReports: GeneratedReport[] = [
      {
        id: 'gen-001',
        planId: 'plan-001',
        planName: '手动报告',
        templateId: 'tmpl-001',
        templateName: '模板A',
        version: 'v1',
        generatedAt: '2024-06-01T08:00:00.000Z',
        filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
        triggerType: 'manual',
        sections: [],
      },
      {
        id: 'gen-002',
        planId: 'plan-002',
        planName: '自动报告',
        templateId: 'tmpl-001',
        templateName: '模板A',
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

    // Filter by manual
    const manualButton = screen.getByRole('button', { name: '手动' })
    await user.click(manualButton)

    expect(screen.getByText('手动报告 v1')).toBeInTheDocument()
    expect(screen.queryByText('自动报告 v2')).not.toBeInTheDocument()

    // Filter by auto
    const autoButtons = screen.getAllByRole('button', { name: '自动' })
    await user.click(autoButtons[autoButtons.length - 1])

    expect(screen.queryByText('手动报告 v1')).not.toBeInTheDocument()
    expect(screen.getByText('自动报告 v2')).toBeInTheDocument()
  })

  it('paginates reports with 10 items per page', async () => {
    const user = userEvent.setup()
    const mockReports: GeneratedReport[] = Array.from({ length: 25 }, (_, i) => ({
      id: `gen-${String(i + 1).padStart(3, '0')}`,
      planId: 'plan-001',
      planName: `报告${i + 1}`,
      templateId: 'tmpl-001',
      templateName: '模板A',
      version: `v${i + 1}`,
      generatedAt: new Date(2024, 5, 25 - i).toISOString(),
      filterScope: { includedIndicatorIds: [], excludedRuleIds: [], excludedLinkRelationIds: [] },
      triggerType: 'manual',
      sections: [],
    }))
    saveGeneratedReports(mockReports)

    render(
      <MemoryRouter>
        <ReportHistoryPage />
      </MemoryRouter>,
    )

    // Page 1: should show first 10 reports
    expect(screen.getByText('报告1 v1')).toBeInTheDocument()
    expect(screen.getByText('报告10 v10')).toBeInTheDocument()
    expect(screen.queryByText('报告11 v11')).not.toBeInTheDocument()

    // DataTable pagination shows page numbers
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()

    // Go to page 2
    await user.click(screen.getByRole('button', { name: '2' }))

    expect(screen.queryByText('报告1 v1')).not.toBeInTheDocument()
    expect(screen.getByText('报告11 v11')).toBeInTheDocument()
    expect(screen.getByText('报告20 v20')).toBeInTheDocument()

    // Go to page 3
    await user.click(screen.getByRole('button', { name: '3' }))

    expect(screen.queryByText('报告20 v20')).not.toBeInTheDocument()
    expect(screen.getByText('报告21 v21')).toBeInTheDocument()
    expect(screen.getByText('报告25 v25')).toBeInTheDocument()
  })
})
