import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeleteTreeNodeSpecialDialog from './DeleteTreeNodeSpecialDialog'

describe('DeleteTreeNodeSpecialDialog', () => {
  it('renders special dialog with attached indicator count', () => {
    render(
      <DeleteTreeNodeSpecialDialog
        open={true}
        onOpenChange={vi.fn()}
        nodeName="利润分析"
        attachedCount={5}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByTestId('delete-special-dialog')).toBeInTheDocument()
    expect(screen.getByText(/5 个指标将回到「待挂靠」区域/)).toBeInTheDocument()
  })

  it('has orange top border', () => {
    render(
      <DeleteTreeNodeSpecialDialog
        open={true}
        onOpenChange={vi.fn()}
        nodeName="利润分析"
        attachedCount={3}
        onConfirm={vi.fn()}
      />,
    )

    const dialog = screen.getByTestId('delete-special-dialog')
    expect(dialog).toHaveClass('border-t-[3px]')
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <DeleteTreeNodeSpecialDialog
        open={true}
        onOpenChange={onOpenChange}
        nodeName="利润分析"
        attachedCount={3}
        onConfirm={onConfirm}
      />,
    )

    const confirmButton = screen.getByTestId('delete-special-confirm-button')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <DeleteTreeNodeSpecialDialog
        open={true}
        onOpenChange={onOpenChange}
        nodeName="利润分析"
        attachedCount={3}
        onConfirm={vi.fn()}
      />,
    )

    const cancelButton = screen.getByTestId('delete-special-cancel-button')
    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not render when open is false', () => {
    render(
      <DeleteTreeNodeSpecialDialog
        open={false}
        onOpenChange={vi.fn()}
        nodeName="利润分析"
        attachedCount={3}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('delete-special-dialog')).not.toBeInTheDocument()
  })
})
