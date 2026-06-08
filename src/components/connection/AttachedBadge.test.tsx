import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttachedBadge from './AttachedBadge'

describe('AttachedBadge', () => {
  const mockIndicators = [
    { id: 'i1', name: '指标 A' },
    { id: 'i2', name: '指标 B' },
    { id: 'i3', name: '指标 C' },
  ]

  it('renders pill badge with count', () => {
    render(
      <AttachedBadge
        count={3}
        indicators={mockIndicators}
        onDeleteOne={vi.fn()}
        onDeleteAll={vi.fn()}
      />,
    )
    const badge = screen.getByTestId('attached-badge')
    expect(badge).toHaveTextContent('已挂靠 3')
    expect(badge).toHaveClass('bg-[var(--dark-accent-primary)]')
  })

  it('does not render when count is 0', () => {
    const { container } = render(
      <AttachedBadge
        count={0}
        indicators={[]}
        onDeleteOne={vi.fn()}
        onDeleteAll={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('expands panel on click', async () => {
    render(
      <AttachedBadge
        count={2}
        indicators={mockIndicators.slice(0, 2)}
        onDeleteOne={vi.fn()}
        onDeleteAll={vi.fn()}
      />,
    )
    const badge = screen.getByTestId('attached-badge')

    await userEvent.click(badge)

    const panel = screen.getByTestId('attached-panel')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveClass('w-60') // 240px = w-60
    expect(screen.getByText('指标 A')).toBeInTheDocument()
    expect(screen.getByText('指标 B')).toBeInTheDocument()
  })

  it('calls onDeleteOne when clicking individual delete button', async () => {
    const onDeleteOne = vi.fn()
    render(
      <AttachedBadge
        count={2}
        indicators={mockIndicators.slice(0, 2)}
        onDeleteOne={onDeleteOne}
        onDeleteAll={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByTestId('attached-badge'))
    const deleteButtons = screen.getAllByTestId('attached-panel-delete-one')
    await userEvent.click(deleteButtons[0])

    expect(onDeleteOne).toHaveBeenCalledWith('i1')
  })

  it('calls onDeleteAll when clicking remove all button', async () => {
    const onDeleteAll = vi.fn()
    render(
      <AttachedBadge
        count={2}
        indicators={mockIndicators.slice(0, 2)}
        onDeleteOne={vi.fn()}
        onDeleteAll={onDeleteAll}
      />,
    )

    await userEvent.click(screen.getByTestId('attached-badge'))
    await userEvent.click(screen.getByTestId('attached-panel-delete-all'))

    expect(onDeleteAll).toHaveBeenCalledTimes(1)
  })

  it('closes panel when clicking outside', async () => {
    render(
      <div>
        <AttachedBadge
          count={2}
          indicators={mockIndicators.slice(0, 2)}
          onDeleteOne={vi.fn()}
          onDeleteAll={vi.fn()}
        />
        <div data-testid="outside">outside</div>
      </div>,
    )

    await userEvent.click(screen.getByTestId('attached-badge'))
    expect(screen.getByTestId('attached-panel')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('outside'))
    expect(screen.queryByTestId('attached-panel')).not.toBeInTheDocument()
  })

  it('shows panel header with count', async () => {
    render(
      <AttachedBadge
        count={3}
        indicators={mockIndicators}
        onDeleteOne={vi.fn()}
        onDeleteAll={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByTestId('attached-badge'))
    expect(screen.getByTestId('attached-panel-header')).toHaveTextContent('已挂靠 3 个指标')
  })
})
