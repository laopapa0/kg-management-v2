import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreeNodeInlineEdit from './TreeNodeInlineEdit'

const mockToast = vi.fn()

vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}))

describe('TreeNodeInlineEdit', () => {
  beforeEach(() => {
    mockToast.mockClear()
  })

  it('renders an input with the initial name', () => {
    render(<TreeNodeInlineEdit initialName="原名称" existingNames={[]} onSave={vi.fn()} onCancel={vi.fn()} />)

    const input = screen.getByTestId('tree-node-inline-input') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('原名称')
  })

  it('focuses and selects the input on mount', () => {
    render(<TreeNodeInlineEdit initialName="原名称" existingNames={[]} onSave={vi.fn()} onCancel={vi.fn()} />)

    const input = screen.getByTestId('tree-node-inline-input') as HTMLInputElement
    expect(document.activeElement).toBe(input)
  })

  it('calls onSave with new name when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<TreeNodeInlineEdit initialName="原名称" existingNames={[]} onSave={onSave} onCancel={vi.fn()} />)

    const input = screen.getByTestId('tree-node-inline-input')
    await user.clear(input)
    await user.type(input, '新名称')
    await user.keyboard('{Enter}')

    expect(onSave).toHaveBeenCalledWith('新名称')
  })

  it('calls onCancel when Esc is pressed', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<TreeNodeInlineEdit initialName="原名称" existingNames={[]} onSave={vi.fn()} onCancel={onCancel} />)

    const input = screen.getByTestId('tree-node-inline-input')
    await user.clear(input)
    await user.type(input, '新名称')
    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onSave with new name on blur', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<TreeNodeInlineEdit initialName="原名称" existingNames={[]} onSave={onSave} onCancel={vi.fn()} />)

    const input = screen.getByTestId('tree-node-inline-input')
    await user.clear(input)
    await user.type(input, '新名称')
    await user.tab()

    expect(onSave).toHaveBeenCalledWith('新名称')
  })

  it('cancels and toasts when input is empty or whitespace-only on blur', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onCancel = vi.fn()
    render(<TreeNodeInlineEdit initialName="原名称" existingNames={[]} onSave={onSave} onCancel={onCancel} />)

    const input = screen.getByTestId('tree-node-inline-input')
    await user.clear(input)
    await user.type(input, '   ')
    await user.tab()

    expect(onSave).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalled()
    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('不能为空'), expect.any(Object))
  })

  it('shows red border and keeps editing when name already exists', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <TreeNodeInlineEdit
        initialName="原名称"
        existingNames={['已存在名称']}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    )

    const input = screen.getByTestId('tree-node-inline-input')
    await user.clear(input)
    await user.type(input, '已存在名称')
    await user.keyboard('{Enter}')

    expect(onSave).not.toHaveBeenCalled()
    expect(input).toHaveClass('border-red-500')
    expect(document.activeElement).toBe(input)
  })
})
