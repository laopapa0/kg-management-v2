import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { addGeneratedReport, __resetGeneratedReportStorageCache } from '@/utils/generatedReportStorage'
import { createGeneratedReport } from '@/models/generatedReportModel'
import ReportDetailPage from './ReportDetailPage'

describe('ReportDetailPage', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetGeneratedReportStorageCache()
  })

  it('renders report name and current version', () => {
    const report = createGeneratedReport({
      planId: 'plan-1',
      planName: '核心指标日报',
      templateId: 'tmpl-1',
      templateName: '日报模板',
      version: 'v0.1',
      triggerType: 'manual',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [{ id: 's1', title: '概览', content: '内容' }],
    })
    addGeneratedReport(report)

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('核心指标日报')).toBeInTheDocument()
    expect(screen.getByTestId('current-version-badge')).toHaveTextContent('v0.1')
  })

  it('shows version history timeline with multiple versions', () => {
    const planId = 'plan-test'

    const v1 = createGeneratedReport({
      planId,
      planName: '测试报告',
      templateId: 'tmpl-1',
      templateName: '模板',
      version: 'v0.1',
      triggerType: 'manual',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [{ id: 's1', title: '概览', content: 'v1内容' }],
    })

    const v2 = createGeneratedReport({
      planId,
      planName: '测试报告',
      templateId: 'tmpl-1',
      templateName: '模板',
      version: 'v0.2',
      triggerType: 'auto',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [{ id: 's1', title: '概览', content: 'v2内容' }],
    })

    addGeneratedReport(v1)
    addGeneratedReport(v2)

    render(
      <MemoryRouter initialEntries={[`/reports/${v2.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('版本历史')).toBeInTheDocument()
    expect(screen.getByTestId('current-version-badge')).toHaveTextContent('v0.2')
    expect(screen.getAllByText('v0.1')).toHaveLength(1)
    expect(screen.getAllByText('v0.2')).toHaveLength(2) // badge + timeline
    expect(screen.getByText(/手动/)).toBeInTheDocument()
    expect(screen.getByText(/自动/)).toBeInTheDocument()
  })

  it('clicking a version in timeline switches to that version', () => {
    const planId = 'plan-test'

    const v1 = createGeneratedReport({
      planId,
      planName: '测试报告',
      templateId: 'tmpl-1',
      templateName: '模板',
      version: 'v0.1',
      triggerType: 'manual',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [{ id: 's1', title: '概览', content: 'v1的旧内容' }],
    })

    const v2 = createGeneratedReport({
      planId,
      planName: '测试报告',
      templateId: 'tmpl-1',
      templateName: '模板',
      version: 'v0.2',
      triggerType: 'auto',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [{ id: 's1', title: '概览', content: 'v2的新内容' }],
    })

    addGeneratedReport(v1)
    addGeneratedReport(v2)

    render(
      <MemoryRouter initialEntries={[`/reports/${v2.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    // Default shows v2 content
    expect(screen.getByText('v2的新内容')).toBeInTheDocument()
    expect(screen.queryByText('v1的旧内容')).not.toBeInTheDocument()

    // Click v1 in timeline
    const v1Item = screen.getByTestId(`version-timeline-${v1.id}`)
    fireEvent.click(v1Item)

    // Now shows v1 content
    expect(screen.getByText('v1的旧内容')).toBeInTheDocument()
    expect(screen.queryByText('v2的新内容')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-version-badge')).toHaveTextContent('v0.1')
  })

  it('enters compare mode and highlights changed sections', () => {
    const planId = 'plan-test'

    const v1 = createGeneratedReport({
      planId,
      planName: '测试报告',
      templateId: 'tmpl-1',
      templateName: '模板',
      version: 'v0.1',
      triggerType: 'manual',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [
        { id: 's1', title: '概览', content: '内容A' },
        { id: 's2', title: '详情', content: '内容B' },
      ],
    })

    const v2 = createGeneratedReport({
      planId,
      planName: '测试报告',
      templateId: 'tmpl-1',
      templateName: '模板',
      version: 'v0.2',
      triggerType: 'auto',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [
        { id: 's1', title: '概览', content: '内容A' },
        { id: 's2', title: '详细分析', content: '内容B' },
      ],
    })

    addGeneratedReport(v1)
    addGeneratedReport(v2)

    render(
      <MemoryRouter initialEntries={[`/reports/${v2.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    // Click compare button on v1 timeline item
    fireEvent.click(screen.getByTestId(`version-compare-${v1.id}`))

    // Shows both versions side by side
    expect(screen.getByTestId('compare-left')).toHaveTextContent('v0.2')
    expect(screen.getByTestId('compare-right')).toHaveTextContent('v0.1')

    // Changed section (s2 title changed from '详情' to '详细分析') is highlighted
    expect(screen.getByTestId('compare-section-s2')).toHaveClass('bg-yellow-500/10')

    // Unchanged section is not highlighted
    const s1 = screen.getByTestId('compare-section-s1')
    expect(s1).not.toHaveClass('bg-yellow-500/10')
  })

  it('rerun generate button navigates to report generation wizard', () => {
    const report = createGeneratedReport({
      planId: 'plan-1',
      planName: '核心指标日报',
      templateId: 'tmpl-1',
      templateName: '日报模板',
      version: 'v0.1',
      triggerType: 'manual',
      filterScope: {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      },
      sections: [{ id: 's1', title: '概览', content: '内容' }],
    })
    addGeneratedReport(report)

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="/reports/generate" element={<div data-testid="generate-wizard-page">生成向导</div>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByTestId('rerun-generate-button'))

    expect(screen.getByTestId('generate-wizard-page')).toBeInTheDocument()
  })
})
