import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
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
    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

    expect(screen.getByText('暂无报告计划')).toBeInTheDocument()
    expect(screen.getByText('创建报告计划以开始自动生成报告')).toBeInTheDocument()
    expect(screen.getByTestId('new-report-plan-button')).toBeInTheDocument()
  })

  it('creates a new report plan and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

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

    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

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

    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

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
    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

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

    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

    expect(screen.getByText('核心指标日报')).toBeInTheDocument()
    expect(screen.getByText('每日')).toBeInTheDocument()
    expect(screen.getByText('核心指标 / 全部部门')).toBeInTheDocument()
    expect(screen.getByText('V12')).toBeInTheDocument()

    expect(screen.getByText('周报汇总')).toBeInTheDocument()
    expect(screen.getByText('每周')).toBeInTheDocument()

    expect(screen.getByText('月度经营分析')).toBeInTheDocument()
    expect(screen.getByText('每月')).toBeInTheDocument()
  })

  it('does not show global generate report button at the top', () => {
    saveReportPlans(mockReportPlans)
    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)
    expect(screen.queryByTestId('generate-report-button')).not.toBeInTheDocument()
  })

  it('shows generate report button for each plan row', () => {
    saveReportPlans(mockReportPlans)
    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)
    expect(screen.getByTestId('generate-report-report-plan-001')).toBeInTheDocument()
    expect(screen.getByTestId('generate-report-report-plan-002')).toBeInTheDocument()
    expect(screen.getByTestId('generate-report-report-plan-003')).toBeInTheDocument()
  })

  it('shows "首次生成" label for plans with latestVersion 0', () => {
    saveReportPlans([{ ...mockReportPlans[0], latestVersion: 0 }])
    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)
    expect(screen.getByText('首次生成')).toBeInTheDocument()
  })

  it('increments latestVersion and generates a report when generate button is clicked', async () => {
    const user = userEvent.setup()
    saveReportPlans([{ ...mockReportPlans[0], latestVersion: 0 }])

    render(<MemoryRouter><ReportManagementPage /></MemoryRouter>)

    const generateButton = screen.getByText('首次生成')
    await user.click(generateButton)

    // Plan updated
    const storedPlans = JSON.parse(localStorage.getItem('kgv2-reports') ?? '[]')
    const plan = storedPlans.find((p: { id: string }) => p.id === 'report-plan-001')
    expect(plan.latestVersion).toBe(1)
    expect(plan.lastGeneratedAt).toBeTruthy()

    // Report generated
    const storedReports = JSON.parse(localStorage.getItem('kgv2-generated-reports') ?? '[]')
    expect(storedReports.length).toBe(1)
    expect(storedReports[0].planId).toBe('report-plan-001')
    expect(storedReports[0].planName).toBe('核心指标日报')
    expect(storedReports[0].triggerType).toBe('manual')
  })

  it('navigates to /reports/:newId after generating a report', async () => {
    const user = userEvent.setup()
    saveReportPlans([{ ...mockReportPlans[0], latestVersion: 0 }])

    render(
      <MemoryRouter initialEntries={['/reports']}>
        <Routes>
          <Route path="/reports" element={<ReportManagementPage />} />
          <Route path="/reports/:id" element={<div data-testid="report-detail-page">Report Detail</div>} />
        </Routes>
      </MemoryRouter>,
    )

    const generateButton = screen.getByText('首次生成')
    await user.click(generateButton)

    expect(screen.getByTestId('report-detail-page')).toBeInTheDocument()
  })
})
