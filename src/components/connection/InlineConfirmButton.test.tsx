import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InlineConfirmButton from './InlineConfirmButton'

describe('InlineConfirmButton', () => {
  it('renders delete icon initially', () => {
    render(<InlineConfirmButton onConfirm={vi.fn()} />)
    const button = screen.getByTestId('inline-confirm-button')
    expect(button).toHaveTextContent('×')
    expect(button).toHaveAttribute('aria-label', '删除挂靠')
  })

  it('transitions to confirm state on first click', async () => {
    render(<InlineConfirmButton onConfirm={vi.fn()} />)
    const button = screen.getByTestId('inline-confirm-button')

    await userEvent.click(button)

    expect(button).toHaveTextContent('确认删除？')
    expect(button).toHaveAttribute('data-confirming', 'true')
    expect(button).toHaveClass('bg-red-500')
    // Width should be wider in confirm state (w-20 = 80px)
    expect(button).toHaveClass('w-20')
  })

  it('calls onConfirm on second click when confirming', async () => {
    const onConfirm = vi.fn()
    render(<InlineConfirmButton onConfirm={onConfirm} />)
    const button = screen.getByTestId('inline-confirm-button')

    await userEvent.click(button) // first click → confirming
    await userEvent.click(button) // second click → confirm

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancels confirmation when clicking outside', async () => {
    render(
      <div>
        <InlineConfirmButton onConfirm={vi.fn()} />
        <div data-testid="outside">outside</div>
      </div>,
    )
    const button = screen.getByTestId('inline-confirm-button')

    await userEvent.click(button)
    expect(button).toHaveTextContent('确认删除？')

    await userEvent.click(screen.getByTestId('outside'))

    await waitFor(() => {
      expect(button).toHaveTextContent('×')
      expect(button).not.toHaveAttribute('data-confirming')
    })
  })

  it('cancels confirmation on Escape key', async () => {
    render(<InlineConfirmButton onConfirm={vi.fn()} />)
    const button = screen.getByTestId('inline-confirm-button')

    await userEvent.click(button)
    expect(button).toHaveTextContent('确认删除？')

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(button).toHaveTextContent('×')
      expect(button).not.toHaveAttribute('data-confirming')
    })
  })

  it('uses custom confirm text when provided', async () => {
    render(<InlineConfirmButton onConfirm={vi.fn()} confirmText="确认移除？" />)
    const button = screen.getByTestId('inline-confirm-button')

    await userEvent.click(button)
    expect(button).toHaveTextContent('确认移除？')
  })

  it('has transition class for width animation', () => {
    render(<InlineConfirmButton onConfirm={vi.fn()} />)
    const button = screen.getByTestId('inline-confirm-button')
    expect(button).toHaveClass('transition-all')
    expect(button).toHaveClass('duration-150')
  })
})
