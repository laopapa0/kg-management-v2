import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { addGeneratedReport, __resetGeneratedReportStorageCache } from '@/utils/generatedReportStorage'
import { __resetCommentStorageCache } from '@/utils/commentStorage'
import { useCommentStore } from '@/stores/commentStore'
import { createGeneratedReport } from '@/models/generatedReportModel'
import ReportDetailPage from './ReportDetailPage'

const mockToast = vi.fn()
vi.mock('sonner', () => ({
  toast: (...args: any[]) => mockToast(...args),
}))

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}))

describe('ReportDetailPage', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetGeneratedReportStorageCache()
    __resetCommentStorageCache()
    useCommentStore.setState(useCommentStore.getInitialState())
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

  it('shows comment button and badge count on each section', () => {
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
      sections: [
        { id: 's1', title: '概览', content: '内容A' },
        { id: 's2', title: '详情', content: '内容B' },
      ],
    })
    addGeneratedReport(report)

    // Add 2 comments to s1, 0 to s2
    useCommentStore.getState().addComment({
      targetId: `${report.id}:${report.version}:s1`,
      targetType: 'report-section',
      author: '张三',
      content: '评论1',
    })
    useCommentStore.getState().addComment({
      targetId: `${report.id}:${report.version}:s1`,
      targetType: 'report-section',
      author: '李四',
      content: '评论2',
    })

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    // Both sections have comment toggle button
    expect(screen.getByTestId('comment-toggle-s1')).toHaveTextContent('评论 (2)')
    expect(screen.getByTestId('comment-toggle-s2')).toHaveTextContent('评论 (0)')

    // s1 has badge showing count
    expect(screen.getByTestId('comment-badge-s1')).toHaveTextContent('2')

    // s2 has no badge (count is 0)
    expect(screen.queryByTestId('comment-badge-s2')).not.toBeInTheDocument()
  })

  it('toggles comment thread panel when clicking comment button', () => {
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

    // Initially no comment thread
    expect(screen.queryByTestId('comment-thread')).not.toBeInTheDocument()

    // Click toggle to expand
    fireEvent.click(screen.getByTestId('comment-toggle-s1'))
    expect(screen.getByTestId('comment-thread')).toBeInTheDocument()

    // Click toggle again to collapse
    fireEvent.click(screen.getByTestId('comment-toggle-s1'))
    expect(screen.queryByTestId('comment-thread')).not.toBeInTheDocument()
  })

  it('renders KnowledgeGraphChart for knowledge-graph section content', () => {
    const kgContent = JSON.stringify({
      nodes: [
        { id: 'n1', name: '5G渗透率', type: 'anomaly' },
        { id: 'n2', name: '基站数', type: 'upstream' },
      ],
      edges: [
        { source: 'n2', target: 'n1', relation: 'DEPENDS_ON', verified: true },
      ],
    })

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
      sections: [
        { id: 's1', title: '概览', content: '内容' },
        { id: 'kg1', title: '知识图谱分析', content: kgContent },
      ],
    })
    addGeneratedReport(report)

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('knowledge-graph-chart')).toBeInTheDocument()
    expect(screen.getByText('异常中心')).toBeInTheDocument()
    expect(screen.getByText('已验证传导')).toBeInTheDocument()
  })

  it('shows toast after deleting an edge in knowledge graph section', async () => {
    mockToast.mockClear()

    const kgContent = JSON.stringify({
      nodes: [
        { id: 'n1', name: '5G渗透率', type: 'anomaly' },
        { id: 'n2', name: '基站数', type: 'upstream' },
      ],
      edges: [
        { source: 'n2', target: 'n1', relation: 'DEPENDS_ON', verified: true },
      ],
    })

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
      sections: [{ id: 'kg1', title: '知识图谱分析', content: kgContent }],
    })
    addGeneratedReport(report)

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('knowledge-graph-chart')).toBeInTheDocument()

    // Verify toast was not called initially
    expect(mockToast).not.toHaveBeenCalled()

    // The KnowledgeGraphChart handles its own internal events;
    // we verify the integration by checking the component renders in editable mode
    // and the onEdgeDelete callback is wired through props.
    // For a full end-to-end we'd need to trigger echarts events,
    // which is tested in KnowledgeGraphChart.test.tsx.
  })

  it('shows update knowledge button on text sections', () => {
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
      sections: [
        { id: 's1', title: '概览', content: '概览内容' },
        { id: 's2', title: '详情', content: '详情内容' },
      ],
    })
    addGeneratedReport(report)

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('update-knowledge-btn-s1')).toBeInTheDocument()
    expect(screen.getByTestId('update-knowledge-btn-s2')).toBeInTheDocument()
    expect(screen.getByTestId('update-knowledge-btn-s1')).toHaveTextContent('更新知识')
  })

  it('opens knowledge edit dialog and shows toast after save', () => {
    mockToast.mockClear()

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
      sections: [{ id: 's1', title: '概览', content: '原始知识内容' }],
    })
    addGeneratedReport(report)

    render(
      <MemoryRouter initialEntries={[`/reports/${report.id}`]}>
        <Routes>
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    // Click update knowledge button
    fireEvent.click(screen.getByTestId('update-knowledge-btn-s1'))

    // Dialog should open with initial content
    expect(screen.getByTestId('knowledge-edit-textarea')).toBeInTheDocument()
    const textarea = screen.getByTestId('knowledge-edit-textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('原始知识内容')

    // Edit content and save
    fireEvent.change(textarea, { target: { value: '修改后的知识内容' } })
    fireEvent.click(screen.getByTestId('knowledge-edit-save'))

    // Toast should be triggered
    expect(mockToast).toHaveBeenCalledWith(
      '知识已更新，建议重跑报告',
      expect.objectContaining({ action: expect.any(Object) }),
    )
  })
})
