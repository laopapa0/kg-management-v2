import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportPlanDialog from './ReportPlanDialog'
import type { ReportPlan } from '@/models/reportModel'

const mockPlan: ReportPlan = {
  id: 'report-1',
  name: '测试计划',
  schedule: 'weekly',
  description: '测试描述',
  filterSummary: '全部指标',
  latestVersion: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('ReportPlanDialog', () => {
  it('renders create mode fields when no initialData', () => {
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: '新建报告计划' })).toBeInTheDocument()
    expect(screen.getByTestId('report-plan-name-input')).toHaveValue('')
    expect(screen.getByTestId('report-plan-schedule-select')).toHaveTextContent('每日')
    expect(screen.getByTestId('report-plan-description-input')).toHaveValue('')
  })

  it('renders edit mode fields with pre-filled values', () => {
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
    expect(screen.getByTestId('report-plan-schedule-select')).toHaveTextContent('每周')
    expect(screen.getByTestId('report-plan-description-input')).toHaveValue('测试描述')
  })

  it('disables confirm button when name is empty', () => {
    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const confirmButton = screen.getByTestId('report-plan-confirm-button')
    expect(confirmButton).toBeDisabled()
  })

  it('calls onConfirm with form data when confirmed', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    const nameInput = screen.getByTestId('report-plan-name-input')
    await user.type(nameInput, '新计划')

    const descInput = screen.getByTestId('report-plan-description-input')
    await user.type(descInput, '新描述')

    const confirmButton = screen.getByTestId('report-plan-confirm-button')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledWith({
      name: '新计划',
      schedule: 'daily',
      description: '新描述',
      autoSchedule: false,
    })
  })

  it('calls onOpenChange with false when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    )

    const cancelButton = screen.getByRole('button', { name: '取消' })
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange with false when confirm is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <ReportPlanDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    )

    const nameInput = screen.getByTestId('report-plan-name-input')
    await user.type(nameInput, '计划')

    const confirmButton = screen.getByTestId('report-plan-confirm-button')
    await user.click(confirmButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
