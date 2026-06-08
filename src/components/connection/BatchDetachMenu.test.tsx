import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BatchDetachMenu from './BatchDetachMenu'

describe('BatchDetachMenu', () => {
  const defaultProps = {
    onViewAttached: vi.fn(),
    detachOptions: [
      { label: '移除所有标签集挂靠', count: 3, onConfirm: vi.fn() },
      { label: '移除所有规则挂靠', count: 2, onConfirm: vi.fn() },
      { label: '移除所有挂靠', count: 5, onConfirm: vi.fn() },
    ],
  }

  it('renders trigger children', () => {
    render(
      <BatchDetachMenu {...defaultProps}>
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('opens context menu on right click', async () => {
    render(
      <BatchDetachMenu {...defaultProps}>
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })

    await waitFor(() => {
      expect(screen.getByTestId('batch-detach-menu')).toBeInTheDocument()
    })
  })

  it('shows menu items including view attached and detach options', async () => {
    render(
      <BatchDetachMenu {...defaultProps}>
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })

    await waitFor(() => {
      expect(screen.getByTestId('menu-view-attached')).toBeInTheDocument()
      expect(screen.getByTestId('menu-detach-0')).toBeInTheDocument()
      expect(screen.getByTestId('menu-detach-1')).toBeInTheDocument()
      expect(screen.getByTestId('menu-detach-2')).toBeInTheDocument()
    })
  })

  it('calls onViewAttached when clicking view option', async () => {
    const onViewAttached = vi.fn()
    render(
      <BatchDetachMenu {...defaultProps} onViewAttached={onViewAttached}>
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await waitFor(() => screen.getByTestId('menu-view-attached'))

    await userEvent.click(screen.getByTestId('menu-view-attached'))
    expect(onViewAttached).toHaveBeenCalledTimes(1)
  })

  it('shows confirm dialog with count when clicking detach option', async () => {
    render(
      <BatchDetachMenu {...defaultProps}>
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await waitFor(() => screen.getByTestId('menu-detach-2'))

    await userEvent.click(screen.getByTestId('menu-detach-2'))

    await waitFor(() => {
      expect(screen.getByTestId('batch-detach-confirm-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-count')).toHaveTextContent('5')
    })
  })

  it('calls onConfirm and closes dialog when confirming', async () => {
    const onConfirm = vi.fn()
    render(
      <BatchDetachMenu
        {...defaultProps}
        detachOptions={[{ label: '移除所有挂靠', count: 5, onConfirm }]}
      >
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await waitFor(() => screen.getByTestId('menu-detach-0'))

    await userEvent.click(screen.getByTestId('menu-detach-0'))
    await waitFor(() => screen.getByTestId('batch-detach-confirm-dialog'))

    await userEvent.click(screen.getByTestId('confirm-dialog-confirm'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByTestId('batch-detach-confirm-dialog')).not.toBeInTheDocument()
    })
  })

  it('closes dialog without calling onConfirm when canceling', async () => {
    const onConfirm = vi.fn()
    render(
      <BatchDetachMenu
        {...defaultProps}
        detachOptions={[{ label: '移除所有挂靠', count: 5, onConfirm }]}
      >
        <div data-testid="trigger">右键这里</div>
      </BatchDetachMenu>,
    )

    await userEvent.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await waitFor(() => screen.getByTestId('menu-detach-0'))

    await userEvent.click(screen.getByTestId('menu-detach-0'))
    await waitFor(() => screen.getByTestId('batch-detach-confirm-dialog'))

    await userEvent.click(screen.getByTestId('confirm-dialog-cancel'))

    expect(onConfirm).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.queryByTestId('batch-detach-confirm-dialog')).not.toBeInTheDocument()
    })
  })
})
