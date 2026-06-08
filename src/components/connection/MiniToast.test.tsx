import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import MiniToast from './MiniToast'

describe('MiniToast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.querySelectorAll('.test-cleanup').forEach((el) => el.remove())
  })

  it('renders message at target element position above 20px', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'toast-target')
    targetEl.style.position = 'absolute'
    targetEl.style.left = '100px'
    targetEl.style.top = '100px'
    targetEl.style.width = '100px'
    targetEl.style.height = '50px'
    document.body.appendChild(targetEl)

    targetEl.getBoundingClientRect = vi.fn(() => ({
      x: 100, y: 100, width: 100, height: 50,
      top: 100, left: 100, right: 200, bottom: 150, toJSON: () => '',
    }))

    const { container } = render(
      <MiniToast targetId="toast-target" message="✓ 指标已挂靠" />,
    )

    const toast = container.querySelector('[data-testid="mini-toast"]')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveTextContent('✓ 指标已挂靠')

    // Should be positioned above target by 20px
    expect(toast).toHaveStyle({ top: '80px' })

    document.body.removeChild(targetEl)
  })

  it('removes from DOM after 2 seconds', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'toast-target-2')
    targetEl.style.position = 'absolute'
    targetEl.style.left = '0px'
    targetEl.style.top = '0px'
    targetEl.style.width = '10px'
    targetEl.style.height = '10px'
    document.body.appendChild(targetEl)

    targetEl.getBoundingClientRect = vi.fn(() => ({
      x: 0, y: 0, width: 10, height: 10,
      top: 0, left: 0, right: 10, bottom: 10, toJSON: () => '',
    }))

    const { container } = render(
      <MiniToast targetId="toast-target-2" message="✓ 指标已挂靠" />,
    )

    expect(container.querySelector('[data-testid="mini-toast"]')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2100)
    })

    expect(container.querySelector('[data-testid="mini-toast"]')).not.toBeInTheDocument()

    document.body.removeChild(targetEl)
  })
})
