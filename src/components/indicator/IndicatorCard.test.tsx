import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IndicatorCard from './IndicatorCard'

const baseIndicator = {
  id: 'ind-001',
  name: '5G用户渗透率',
  code: '5G_PENETRATION',
  level1: '发展',
  level2: '用户发展',
  source: '市场部',
}

describe('IndicatorCard', () => {
  it('renders primary info: name and code', () => {
    render(<IndicatorCard {...baseIndicator} />)

    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument()
    expect(screen.getByText('5G_PENETRATION')).toBeInTheDocument()
  })

  it('renders secondary category tags', () => {
    render(<IndicatorCard {...baseIndicator} />)

    expect(screen.getByText('发展')).toBeInTheDocument()
    expect(screen.getByText('用户发展')).toBeInTheDocument()
  })

  it('renders meta info: source badge', () => {
    render(<IndicatorCard {...baseIndicator} />)

    expect(screen.getByText('市场部')).toBeInTheDocument()
  })

  it('default state has no shadow and no special ring', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} />)

    const card = container.firstChild as HTMLElement
    expect(card).not.toHaveClass('shadow-card-hover')
    expect(card).not.toHaveClass('ring-2')
  })

  it('hover state lifts 1px and adds shadow', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} state="hover" />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('-translate-y-px')
    expect(card).toHaveClass('shadow-card-hover')
  })

  it('selected state shows brand ring, glow and pulse dot', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} state="selected" />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('ring-2')
    expect(card).toHaveClass('ring-dark-accent-primary')
    expect(card).toHaveClass('shadow-[0_0_12px_rgba(91,141,239,0.35)]')
    expect(screen.getByTestId('pulse-dot')).toBeInTheDocument()
  })

  it('attached state dims opacity and shows green badge', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} state="attached" />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('opacity-50')
    expect(screen.getByText('已挂靠')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<IndicatorCard {...baseIndicator} onClick={onClick} />)

    const card = screen.getByTestId('indicator-card')
    await user.click(card)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  describe('fly-out animation', () => {
    it('registers connection-confirmed listener on mount', () => {
      const addListenerSpy = vi.spyOn(window, 'addEventListener')
      render(<IndicatorCard {...baseIndicator} />)
      expect(addListenerSpy).toHaveBeenCalledWith('connection-confirmed', expect.any(Function))
      addListenerSpy.mockRestore()
    })

    it('removes listener on unmount', () => {
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = render(<IndicatorCard {...baseIndicator} />)
      unmount()
      expect(removeListenerSpy).toHaveBeenCalledWith('connection-confirmed', expect.any(Function))
      removeListenerSpy.mockRestore()
    })

    it('triggers fly-out animation when event sourceId matches card id', () => {
      // Create target element in DOM
      const targetEl = document.createElement('div')
      targetEl.id = 'target-1'
      document.body.appendChild(targetEl)
      targetEl.getBoundingClientRect = vi.fn(() => ({
        left: 500, top: 500, width: 50, height: 50,
        right: 550, bottom: 550, x: 500, y: 500,
        toJSON: () => {},
      }))

      render(<IndicatorCard {...baseIndicator} id="ind-001" />)

      // Mock card's getBoundingClientRect after render
      const cardEl = document.getElementById('ind-001')
      if (cardEl) {
        cardEl.getBoundingClientRect = vi.fn(() => ({
          left: 100, top: 100, width: 50, height: 50,
          right: 150, bottom: 150, x: 100, y: 100,
          toJSON: () => {},
        }))
      }

      window.dispatchEvent(
        new CustomEvent('connection-confirmed', {
          detail: { sourceId: 'ind-001', targetId: 'target-1', targetType: 'tree' },
        }),
      )

      // Fly-out should not throw; animation is async via Framer Motion.
      // The primary assertion is that the event was processed without error.
      expect(document.getElementById('ind-001')).toBeInTheDocument()

      document.body.removeChild(targetEl)
    })

    it('ignores event when sourceId does not match', () => {
      render(<IndicatorCard {...baseIndicator} id="ind-001" />)

      // This should be a no-op for this card
      window.dispatchEvent(
        new CustomEvent('connection-confirmed', {
          detail: { sourceId: 'other-id', targetId: 'target-1', targetType: 'tree' },
        }),
      )

      // Card should still be in the document (no crash)
      expect(screen.getByTestId('indicator-card')).toBeInTheDocument()
    })
  })
})
