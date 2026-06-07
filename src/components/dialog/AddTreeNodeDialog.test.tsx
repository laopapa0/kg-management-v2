import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddTreeNodeDialog from './AddTreeNodeDialog'

describe('AddTreeNodeDialog', () => {
  it('renders name input and location radios when open', () => {
    render(
      <AddTreeNodeDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedNodeId={null}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByTestId('add-node-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('add-node-root-radio')).toBeInTheDocument()
    expect(screen.getByTestId('add-node-child-radio')).toBeInTheDocument()
  })

  it('defaults to root when no node is selected', () => {
    render(
      <AddTreeNodeDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedNodeId={null}
        onConfirm={vi.fn()}
      />,
    )

    const rootRadio = screen.getByTestId('add-node-root-radio')
    const childRadio = screen.getByTestId('add-node-child-radio')
    expect(rootRadio).toHaveAttribute('data-state', 'checked')
    expect(childRadio).toHaveAttribute('data-state', 'unchecked')
  })

  it('defaults to child when a node is selected', () => {
    render(
      <AddTreeNodeDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedNodeId="node-1"
        onConfirm={vi.fn()}
      />,
    )

    const rootRadio = screen.getByTestId('add-node-root-radio')
    const childRadio = screen.getByTestId('add-node-child-radio')
    expect(rootRadio).toHaveAttribute('data-state', 'unchecked')
    expect(childRadio).toHaveAttribute('data-state', 'checked')
  })

  it('calls onConfirm with name and undefined parent when root is chosen', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <AddTreeNodeDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedNodeId={null}
        onConfirm={onConfirm}
      />,
    )

    const input = screen.getByTestId('add-node-name-input')
    await user.type(input, '新节点')

    const confirmButton = screen.getByTestId('add-node-confirm-button')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledWith('新节点', undefined)
  })

  it('calls onConfirm with name and selectedNodeId when child is chosen', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <AddTreeNodeDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedNodeId="node-1"
        onConfirm={onConfirm}
      />,
    )

    const input = screen.getByTestId('add-node-name-input')
    await user.type(input, '子节点')

    const confirmButton = screen.getByTestId('add-node-confirm-button')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledWith('子节点', 'node-1')
  })

  it('does not confirm when name is empty', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <AddTreeNodeDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedNodeId={null}
        onConfirm={onConfirm}
      />,
    )

    const confirmButton = screen.getByTestId('add-node-confirm-button')
    await user.click(confirmButton)

    expect(onConfirm).not.toHaveBeenCalled()
  })
})
