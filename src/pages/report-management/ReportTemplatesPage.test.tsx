import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockReportTemplates } from '@/models/reportTemplateModel'
import {
  getReportTemplates,
  saveReportTemplates,
  __resetReportTemplateStorageCache,
} from '@/utils/reportTemplateStorage'
import ReportTemplatesPage from './ReportTemplatesPage'

describe('ReportTemplatesPage', () => {
  beforeEach(() => {
    __resetReportTemplateStorageCache()
    localStorage.clear()
    saveReportTemplates(mockReportTemplates)
  })

  it('renders template list with name, section count, usage count and enabled status', () => {
    render(<ReportTemplatesPage />)

    expect(screen.getByText('月报标准模板')).toBeInTheDocument()
    expect(screen.getByText('周报速览模板')).toBeInTheDocument()

    // section counts: 月报标准模板 6 个板块，周报速览模板 5 个板块
    expect(screen.getByText('6 个板块')).toBeInTheDocument()
    expect(screen.getByText('5 个板块')).toBeInTheDocument()

    // usage counts
    expect(screen.getByText('已使用 42 次')).toBeInTheDocument()
    expect(screen.getByText('已使用 12 次')).toBeInTheDocument()

    // enabled status (both are enabled)
    const enabledLabels = screen.getAllByText('启用')
    expect(enabledLabels).toHaveLength(2)
  })

  it('opens create dialog when clicking 新建模板 button', async () => {
    render(<ReportTemplatesPage />)

    const btn = screen.getByRole('button', { name: /新建模板/ })
    await userEvent.click(btn)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('新建报告模板')).toBeInTheDocument()
  })

  it('renders template name, description and section inputs in create dialog', async () => {
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))

    expect(screen.getByPlaceholderText('模板名称')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('模板描述')).toBeInTheDocument()
    expect(screen.getByText('板块列表')).toBeInTheDocument()
  })

  it('allows adding and removing sections in the dialog', async () => {
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))
    await userEvent.click(screen.getByRole('button', { name: /添加板块/ }))

    const titleInputs = screen.getAllByPlaceholderText('板块标题')
    expect(titleInputs).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: /删除板块/ }))
    expect(screen.queryByPlaceholderText('板块标题')).not.toBeInTheDocument()
  })

  it('fills prompt input when clicking a preset tag', async () => {
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))
    await userEvent.click(screen.getByRole('button', { name: /添加板块/ }))

    const presetBtn = screen.getByRole('button', { name: '检测异常值并标注' })
    await userEvent.click(presetBtn)

    const promptInput = screen.getByPlaceholderText('输入提示词或点击下方预选项填充')
    expect(promptInput).toHaveValue('检测异常值并标注')
  })

  it('saves a new template and shows it in the list', async () => {
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))
    await userEvent.type(screen.getByPlaceholderText('模板名称'), '测试模板')
    await userEvent.type(screen.getByPlaceholderText('模板描述'), '测试描述')
    await userEvent.click(screen.getByRole('button', { name: /添加板块/ }))
    await userEvent.type(screen.getByPlaceholderText('板块标题'), '测试板块')
    await userEvent.click(screen.getByRole('button', { name: /保存/ }))

    expect(screen.getByText('测试模板')).toBeInTheDocument()
    expect(screen.getByText('测试描述')).toBeInTheDocument()
  })

  it('toggles template enabled status', async () => {
    render(<ReportTemplatesPage />)

    const switches = screen.getAllByRole('switch')
    expect(switches[0]).toBeChecked()

    await userEvent.click(switches[0])
    expect(switches[0]).not.toBeChecked()

    const statusLabels = screen.getAllByText(/启用|停用/)
    expect(statusLabels[0]).toHaveTextContent('停用')
  })

  it('shows style guide input in create dialog', async () => {
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))

    expect(screen.getByPlaceholderText(/整体风格要求/)).toBeInTheDocument()
  })

  it('shows AI generation panel in create dialog', async () => {
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))

    expect(screen.getByText('AI 生成板块')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/描述你的报告需求/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /开始生成/ })).toBeInTheDocument()
  })

  it('generates sections via AI and fills them into the dialog', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(<ReportTemplatesPage />)

    await userEvent.click(screen.getByRole('button', { name: /新建模板/ }))
    await userEvent.type(screen.getByPlaceholderText(/描述你的报告需求/), '月度运营分析报告')

    const generateBtn = screen.getByRole('button', { name: /开始生成/ })
    await userEvent.click(generateBtn)

    // Button should show loading state
    expect(screen.getByText('生成中...')).toBeInTheDocument()

    // Advance timers to complete generation
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue('核心指标概览')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('异常波动检测')).toBeInTheDocument()
    expect(screen.getByDisplayValue('智能归因分析')).toBeInTheDocument()

    vi.useRealTimers()
  })
})
