import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteTreeNodeWarningDialog from './DeleteTreeNodeWarningDialog'

describe('DeleteTreeNodeWarningDialog', () => {
  it('renders warning dialog with child count', () => {
    render(
      <DeleteTreeNodeWarningDialog
        open={true}
        onOpenChange={vi.fn()}
        nodeName="利润分析"
        childCount={3}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByTestId('delete-warning-dialog')).toBeInTheDocument()
    expect(screen.getByText('此操作将删除 3 个子节点，是否继续？')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <DeleteTreeNodeWarningDialog
        open={true}
        onOpenChange={onOpenChange}
        nodeName="利润分析"
        childCount={3}
        onConfirm={onConfirm}
      />,
    )

    const confirmButton = screen.getByTestId('delete-warning-confirm-button')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <DeleteTreeNodeWarningDialog
        open={true}
        onOpenChange={onOpenChange}
        nodeName="利润分析"
        childCount={3}
        onConfirm={vi.fn()}
      />,
    )

    const cancelButton = screen.getByTestId('delete-warning-cancel-button')
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not render when open is false', () => {
    render(
      <DeleteTreeNodeWarningDialog
        open={false}
        onOpenChange={vi.fn()}
        nodeName="利润分析"
        childCount={3}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('delete-warning-dialog')).not.toBeInTheDocument()
  })
})
