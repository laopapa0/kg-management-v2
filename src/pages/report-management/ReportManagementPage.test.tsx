import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetReportStorageCache } from '@/utils/reportStorage'
import { mockReportPlans } from '@/models/reportModel'
import { saveReportPlans } from '@/utils/reportStorage'
import ReportManagementPage from './ReportManagementPage'

describe('ReportManagementPage', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetReportStorageCache()
  })

  it('shows empty state with new plan button when no plans exist', () => {
    render(<ReportManagementPage />)

    expect(screen.getByText('暂无报告计划')).toBeInTheDocument()
    expect(screen.getByText('创建报告计划以开始自动生成报告')).toBeInTheDocument()
    expect(screen.getByTestId('new-report-plan-button')).toBeInTheDocument()
  })

  it('creates a new report plan and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<ReportManagementPage />)

    const newButton = screen.getByTestId('new-report-plan-button')
    await user.click(newButton)

    const nameInput = screen.getByTestId('report-plan-name-input')
    await user.type(nameInput, '测试日报')

    const descInput = screen.getByTestId('report-plan-description-input')
    await user.type(descInput, '这是一个测试报告')

    const confirmButton = screen.getByTestId('report-plan-confirm-button')
    await user.click(confirmButton)

    // Dialog should close
    expect(screen.queryByRole('heading', { name: '新建报告计划' })).not.toBeInTheDocument()

    // New plan should appear in the list
    expect(screen.getByText('测试日报')).toBeInTheDocument()
    expect(screen.getByText('每日')).toBeInTheDocument()

    // Should persist to localStorage
    const stored = JSON.parse(localStorage.getItem('kgv2-reports') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('测试日报')
    expect(stored[0].schedule).toBe('daily')
    expect(stored[0].description).toBe('这是一个测试报告')
  })

  it('edits an existing report plan and updates the list', async () => {
    const user = userEvent.setup()
    saveReportPlans(mockReportPlans)

    render(<ReportManagementPage />)

    const editButton = screen.getByTestId('edit-report-plan-report-plan-001')
    await user.click(editButton)

    expect(screen.getByRole('heading', { name: '编辑报告计划' })).toBeInTheDocument()

    const nameInput = screen.getByTestId('report-plan-name-input') as HTMLInputElement
    expect(nameInput.value).toBe('核心指标日报')

    fireEvent.change(nameInput, { target: { value: '核心指标日报-已修改' } })

    const confirmButton = screen.getByTestId('report-plan-confirm-button')
    await user.click(confirmButton)

    expect(screen.getByText('核心指标日报-已修改')).toBeInTheDocument()
    expect(screen.queryByText('核心指标日报')).not.toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem('kgv2-reports') ?? '[]')
    const updated = stored.find((p: { id: string }) => p.id === 'report-plan-001')
    expect(updated.name).toBe('核心指标日报-已修改')
  })

  it('deletes a report plan and removes it from the list', async () => {
    const user = userEvent.setup()
    saveReportPlans(mockReportPlans)

    render(<ReportManagementPage />)

    expect(screen.getByText('核心指标日报')).toBeInTheDocument()

    const deleteButton = screen.getByTestId('delete-report-plan-report-plan-001')
    await user.click(deleteButton)

    expect(screen.queryByText('核心指标日报')).not.toBeInTheDocument()
    expect(screen.getByText('周报汇总')).toBeInTheDocument()
    expect(screen.getByText('月度经营分析')).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem('kgv2-reports') ?? '[]')
    expect(stored).toHaveLength(2)
    expect(stored.find((p: { id: string }) => p.id === 'report-plan-001')).toBeUndefined()
  })

  it('opens create dialog when new plan button is clicked', async () => {
    const user = userEvent.setup()
    render(<ReportManagementPage />)

    const newButton = screen.getByTestId('new-report-plan-button')
    await user.click(newButton)

    expect(screen.getByRole('heading', { name: '新建报告计划' })).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-schedule-select')).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-description-input')).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-confirm-button')).toBeInTheDocument()
  })

  it('renders report plan list with name, schedule, filter summary, version and generation time', () => {
    saveReportPlans(mockReportPlans)

    render(<ReportManagementPage />)

    expect(screen.getByText('核心指标日报')).toBeInTheDocument()
    expect(screen.getByText('每日')).toBeInTheDocument()
    expect(screen.getByText('核心指标 / 全部部门')).toBeInTheDocument()
    expect(screen.getByText('V12')).toBeInTheDocument()

    expect(screen.getByText('周报汇总')).toBeInTheDocument()
    expect(screen.getByText('每周')).toBeInTheDocument()

    expect(screen.getByText('月度经营分析')).toBeInTheDocument()
    expect(screen.getByText('每月')).toBeInTheDocument()
  })
})
