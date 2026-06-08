import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import PulseRing from './PulseRing'

describe('PulseRing', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.querySelectorAll('.test-cleanup').forEach((el) => el.remove())
  })

  it('has two colored rings (blue inner + green outer)', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'target-ring-colors')
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

    const { container } = render(<PulseRing targetId="target-ring-colors" />)

    const ring = container.querySelector('[data-testid="pulse-ring"]')
    const borders = ring!.querySelectorAll('div')
    expect(borders.length).toBe(2)
    expect(borders[0]).toHaveStyle({ borderColor: '#3B82F6' })
    expect(borders[1]).toHaveStyle({ borderColor: '#22C55E' })

    document.body.removeChild(targetEl)
  })

  it('renders a ring at the target element position', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'target-1')
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

    const { container } = render(<PulseRing targetId="target-1" />)

    const ring = container.querySelector('[data-testid="pulse-ring"]')
    expect(ring).toBeInTheDocument()

    document.body.removeChild(targetEl)
  })

  it('applies pulse ring animation class', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'target-anim')
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

    const { container } = render(<PulseRing targetId="target-anim" />)

    const ring = container.querySelector('[data-testid="pulse-ring"]')
    expect(ring).toHaveClass('animate-pulse-ring')

    document.body.removeChild(targetEl)
  })

  it('applies stroke-width animation class to both inner and outer ring borders', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'target-stroke')
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

    const { container } = render(<PulseRing targetId="target-stroke" />)

    const ring = container.querySelector('[data-testid="pulse-ring"]')
    const borders = ring!.querySelectorAll('div')
    expect(borders.length).toBe(2)
    expect(borders[0]).toHaveClass('animate-pulse-ring-stroke')
    expect(borders[1]).toHaveClass('animate-pulse-ring-stroke')

    document.body.removeChild(targetEl)
  })

  it('removes from DOM after 400ms', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-indicator-id', 'target-2')
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

    const { container } = render(<PulseRing targetId="target-2" />)
    expect(container.querySelector('[data-testid="pulse-ring"]')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(450)
    })

    expect(container.querySelector('[data-testid="pulse-ring"]')).not.toBeInTheDocument()

    document.body.removeChild(targetEl)
  })
})
