import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportPlanDialog from './ReportPlanDialog'
import type { ReportPlan } from '@/models/reportModel'
import { saveReportTemplates } from '@/utils/reportTemplateStorage'
import { mockReportTemplates } from '@/models/reportTemplateModel'

const mockPlan: ReportPlan = {
  id: 'report-1',
  name: '测试计划',
  schedule: 'weekly',
  description: '测试描述',
  filterSummary: '全部指标',
  latestVersion: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('ReportPlanDialog — 三步向导', () => {
  beforeEach(() => {
    localStorage.clear()
    saveReportTemplates(mockReportTemplates)
    // Setup minimal attachment data for FilterScopeSelector
    localStorage.setItem('kgv2-attachment-departments', JSON.stringify([{ id: 'dept-1', name: '财务部' }]))
    localStorage.setItem('kgv2-attachment-indicators-dept-1', JSON.stringify([]))
    localStorage.setItem('kgv2-attachment-tagnodes-dept-1', JSON.stringify([]))
    localStorage.setItem('kgv2-attachment-rules', JSON.stringify([]))
  })

  it('shows step 1 with name input, schedule radios and description', () => {
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByTestId('step-1')).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-name-input')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '每日' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '每周' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '每月' })).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-description-input')).toBeInTheDocument()
  })

  it('disables next button when name is empty in step 1', () => {
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const nextButton = screen.getByTestId('report-plan-next-button')
    expect(nextButton).toBeDisabled()
  })

  it('navigates to step 2 when clicking next with valid name', async () => {
    const user = userEvent.setup()
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await user.type(screen.getByTestId('report-plan-name-input'), '测试计划')
    await user.click(screen.getByTestId('report-plan-next-button'))

    expect(screen.getByTestId('step-2')).toBeInTheDocument()
    expect(screen.getByTestId('step-indicator-2')).toHaveClass('bg-dark-accent-primary')
  })

  it('renders FilterScopeSelector in step 2 and supports prev/next navigation', async () => {
    const user = userEvent.setup()
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await user.type(screen.getByTestId('report-plan-name-input'), '测试计划')
    await user.click(screen.getByTestId('report-plan-next-button'))

    // Step 2 shows FilterScopeSelector
    expect(screen.getByTestId('filter-scope-selector')).toBeInTheDocument()

    // Back to step 1
    await user.click(screen.getByRole('button', { name: '上一步' }))
    expect(screen.getByTestId('step-1')).toBeInTheDocument()

    // Forward to step 2 again
    await user.click(screen.getByTestId('report-plan-next-button'))
    expect(screen.getByTestId('step-2')).toBeInTheDocument()

    // Forward to step 3
    await user.click(screen.getByTestId('report-plan-next-button'))
    expect(screen.getByTestId('step-3')).toBeInTheDocument()
  })

  it('shows enabled templates in step 4', async () => {
    const user = userEvent.setup()
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await user.type(screen.getByTestId('report-plan-name-input'), '测试计划')
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))

    // Shows enabled templates
    expect(screen.getByText('月报标准模板')).toBeInTheDocument()
    expect(screen.getByText('周报速览模板')).toBeInTheDocument()

    // Can select a template
    await user.click(screen.getByTestId('template-radio-tmpl-001'))
    expect(screen.getByTestId('template-radio-tmpl-001')).toBeChecked()
  })

  it('calls onConfirm with full data when clicking save plan', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    )

    await user.type(screen.getByTestId('report-plan-name-input'), '测试计划')
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-save-button'))

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      name: '测试计划',
      schedule: 'daily',
      description: '',
      autoSchedule: false,
      filterScope: expect.any(Object),
    }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onSaveAndGenerate when clicking save and generate', async () => {
    const user = userEvent.setup()
    const onSaveAndGenerate = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
        onSaveAndGenerate={onSaveAndGenerate}
      />,
    )

    await user.type(screen.getByTestId('report-plan-name-input'), '测试计划')
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-save-generate-button'))

    expect(onSaveAndGenerate).toHaveBeenCalledWith(expect.objectContaining({
      name: '测试计划',
      schedule: 'daily',
      autoSchedule: false,
      filterScope: expect.any(Object),
    }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('pre-fills values and shows edit title in edit mode', () => {
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        initialData={mockPlan}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: '编辑报告计划' })).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-name-input')).toHaveValue('测试计划')
    expect(screen.getByRole('radio', { name: '每周' })).toBeChecked()
    expect(screen.getByTestId('report-plan-description-input')).toHaveValue('测试描述')
  })

  it('shows "保存并重新生成" in edit mode', async () => {
    const user = userEvent.setup()
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        initialData={mockPlan}
        onConfirm={vi.fn()}
        onSaveAndGenerate={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))
    await user.click(screen.getByTestId('report-plan-next-button'))

    expect(screen.getByTestId('report-plan-save-generate-button')).toHaveTextContent('保存并重新生成')
  })

  describe('发散分析', () => {
    it('Step 4 模板选择下方有分割线和发散分析区块', async () => {
      const user = userEvent.setup()
      render(<ReportPlanDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />)

      await user.type(screen.getByTestId('report-plan-name-input'), '测试')
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByTestId('report-plan-next-button'))
      }

      expect(screen.getByTestId('divergence-section')).toBeInTheDocument()
      expect(screen.getByText('发散分析')).toBeInTheDocument()
    })

    it('Switch 默认关闭，打开后提示词输入框显示', async () => {
      const user = userEvent.setup()
      render(<ReportPlanDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />)

      await user.type(screen.getByTestId('report-plan-name-input'), '测试')
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByTestId('report-plan-next-button'))
      }

      const switchEl = screen.getByTestId('divergence-switch')
      expect(switchEl).not.toBeChecked()

      await user.click(switchEl)
      expect(switchEl).toBeChecked()

      expect(screen.getByTestId('divergence-prompt-textarea')).toBeInTheDocument()
    })

    it('保存时发散分析字段包含在表单数据中', async () => {
      const user = userEvent.setup()
      const onConfirm = vi.fn()
      render(<ReportPlanDialog open={true} onOpenChange={vi.fn()} onConfirm={onConfirm} />)

      // Step 1: 填写名称
      await user.type(screen.getByTestId('report-plan-name-input'), '测试')
      // Step 1→2→3→4
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByTestId('report-plan-next-button'))
      }

      // 开启发散分析
      await user.click(screen.getByTestId('divergence-switch'))
      await user.type(screen.getByTestId('divergence-prompt-textarea'), '分析营收趋势')

      await user.click(screen.getByTestId('report-plan-save-button'))

      expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
        divergenceEnabled: true,
        divergencePrompt: '分析营收趋势',
      }))
    })
  })
})
