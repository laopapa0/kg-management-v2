import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

    expect(screen.getByText('核心指标日报模板')).toBeInTheDocument()
    expect(screen.getByText('月度经营分析模板')).toBeInTheDocument()

    // section counts (both mock templates have 3 sections)
    const sectionCounts = screen.getAllByText('3 个板块')
    expect(sectionCounts).toHaveLength(2)

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
})
