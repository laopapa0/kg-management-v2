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

  it('renders generated report cards with plan name, version, template, date and trigger type', () => {
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

    const card1 = screen.getByTestId('report-history-card-gen-001')
    expect(card1).toHaveTextContent('核心指标日报')
    expect(card1).toHaveTextContent('v1')
    expect(card1).toHaveTextContent('标准日报模板')
    expect(card1).toHaveTextContent('手动')

    const card2 = screen.getByTestId('report-history-card-gen-002')
    expect(card2).toHaveTextContent('周报汇总')
    expect(card2).toHaveTextContent('v2')
    expect(card2).toHaveTextContent('周报模板')
    expect(card2).toHaveTextContent('自动')
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

    const cards = screen.getAllByTestId(/report-history-card-/)
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveAttribute('data-testid', 'report-history-card-gen-002')
    expect(cards[1]).toHaveAttribute('data-testid', 'report-history-card-gen-003')
    expect(cards[2]).toHaveAttribute('data-testid', 'report-history-card-gen-001')
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
    expect(screen.getByTestId('report-history-card-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-002')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-003')).toBeInTheDocument()

    // Filter by plan-001 (click the plan button)
    const planButton = screen.getByRole('button', { name: '核心指标日报' })
    await user.click(planButton)

    expect(screen.getByTestId('report-history-card-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-002')).toBeInTheDocument()
    expect(screen.queryByTestId('report-history-card-gen-003')).not.toBeInTheDocument()

    // Filter by all (plan filter "全部" button — first of two "全部" buttons on page)
    const allButtons = screen.getAllByRole('button', { name: '全部' })
    expect(allButtons.length).toBe(2)
    await user.click(allButtons[0])

    expect(screen.getByTestId('report-history-card-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-002')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-003')).toBeInTheDocument()
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

    expect(screen.getByTestId('report-history-card-gen-001')).toBeInTheDocument()
    expect(screen.queryByTestId('report-history-card-gen-002')).not.toBeInTheDocument()

    // Filter by auto (there are two "自动" buttons — plan name and trigger type; use the trigger filter one)
    const autoButtons = screen.getAllByRole('button', { name: '自动' })
    await user.click(autoButtons[autoButtons.length - 1])

    expect(screen.queryByTestId('report-history-card-gen-001')).not.toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-002')).toBeInTheDocument()
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

    // Page 1 should show 10 items
    expect(screen.getAllByTestId(/report-history-card-/)).toHaveLength(10)
    expect(screen.getByTestId('report-history-card-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('report-history-card-gen-010')).toBeInTheDocument()
    expect(screen.queryByTestId('report-history-card-gen-011')).not.toBeInTheDocument()

    // Pagination info
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('1 / 3')

    // Next page
    const nextButton = screen.getByTestId('pagination-next')
    expect(nextButton).not.toBeDisabled()
    await user.click(nextButton)

    expect(screen.getAllByTestId(/report-history-card-/)).toHaveLength(10)
    expect(screen.getByTestId('report-history-card-gen-011')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('2 / 3')

    // Prev page
    const prevButton = screen.getByTestId('pagination-prev')
    await user.click(prevButton)

    expect(screen.getByTestId('report-history-card-gen-001')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-info')).toHaveTextContent('1 / 3')
  })
})
