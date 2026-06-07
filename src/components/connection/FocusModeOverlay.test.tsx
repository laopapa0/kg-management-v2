import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import FocusModeOverlay from './FocusModeOverlay'

describe('FocusModeOverlay', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.useRealTimers()
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('does not render when not visible', () => {
    render(
      <FocusModeOverlay
        isVisible={false}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )
    expect(screen.queryByTestId('focus-mode-overlay')).not.toBeInTheDocument()
  })

  it('renders overlay when visible', () => {
    render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )
    expect(screen.getByTestId('focus-mode-overlay')).toBeInTheDocument()
  })

  it('renders fixed SVG with correct CSS classes and z-index', () => {
    render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )

    const svg = screen.getByTestId('focus-mode-overlay')
    expect(svg.tagName).toBe('svg')
    expect(svg).toHaveClass('fixed', 'inset-0', 'pointer-events-none')
    expect(svg).toHaveStyle({ 'z-index': '40' })
  })

  it('has opacity transition style', () => {
    render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )

    const svg = screen.getByTestId('focus-mode-overlay')
    expect(svg).toHaveStyle({ transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)' })
  })

  it('creates a spotlight hole for the source indicator element', () => {
    // create a source indicator element in DOM
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'ind-1')
    sourceEl.style.position = 'absolute'
    sourceEl.style.left = '100px'
    sourceEl.style.top = '200px'
    sourceEl.style.width = '260px'
    sourceEl.style.height = '120px'
    document.body.appendChild(sourceEl)

    // mock getBoundingClientRect for the source element
    sourceEl.getBoundingClientRect = vi.fn(() => ({
      x: 100,
      y: 200,
      width: 260,
      height: 120,
      top: 200,
      left: 100,
      right: 360,
      bottom: 320,
      toJSON: () => '',
    }))

    render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )

    // advance timers to let the update effect run
    vi.advanceTimersByTime(100)

    // query inside the rendered SVG for mask black rects
    const svg = screen.getByTestId('focus-mode-overlay')
    const maskRects = svg.querySelectorAll('mask rect[fill="black"]')
    expect(maskRects.length).toBe(1)
    expect(maskRects[0]).toHaveAttribute('x', '100')
    expect(maskRects[0]).toHaveAttribute('y', '200')
    expect(maskRects[0]).toHaveAttribute('width', '260')
    expect(maskRects[0]).toHaveAttribute('height', '120')

    document.body.removeChild(sourceEl)
  })

  it('creates spotlight holes for valid target elements', () => {
    // create source indicator
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'src-1')
    sourceEl.style.position = 'absolute'
    sourceEl.style.left = '10px'
    sourceEl.style.top = '10px'
    sourceEl.style.width = '100px'
    sourceEl.style.height = '50px'
    document.body.appendChild(sourceEl)
    sourceEl.getBoundingClientRect = vi.fn(() => ({
      x: 10, y: 10, width: 100, height: 50,
      top: 10, left: 10, right: 110, bottom: 60, toJSON: () => '',
    }))

    // create a valid tree target
    const targetEl = document.createElement('div')
    targetEl.setAttribute('data-node-id', 'tree-1')
    targetEl.style.position = 'absolute'
    targetEl.style.left = '400px'
    targetEl.style.top = '100px'
    targetEl.style.width = '200px'
    targetEl.style.height = '40px'
    document.body.appendChild(targetEl)
    targetEl.getBoundingClientRect = vi.fn(() => ({
      x: 400, y: 100, width: 200, height: 40,
      top: 100, left: 400, right: 600, bottom: 140, toJSON: () => '',
    }))

    render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="src-1"
        validTargetIds={new Set(['tree-1'])}
        targetType="tree"
      />,
    )

    vi.advanceTimersByTime(100)

    const svg = screen.getByTestId('focus-mode-overlay')
    const maskRects = svg.querySelectorAll('mask rect[fill="black"]')
    expect(maskRects.length).toBe(2)

    // source rect
    expect(maskRects[0]).toHaveAttribute('x', '10')
    expect(maskRects[0]).toHaveAttribute('y', '10')

    // target rect
    expect(maskRects[1]).toHaveAttribute('x', '400')
    expect(maskRects[1]).toHaveAttribute('y', '100')

    document.body.removeChild(sourceEl)
    document.body.removeChild(targetEl)
  })

  it('registers scroll and resize listeners when visible', () => {
    render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )

    const scrollCalls = addEventListenerSpy.mock.calls.filter(
      ([type, _, opts]) => type === 'scroll' && opts?.passive === true,
    )
    expect(scrollCalls.length).toBeGreaterThanOrEqual(1)

    const resizeCalls = addEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'resize',
    )
    expect(resizeCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('removes listeners on unmount', () => {
    const { unmount } = render(
      <FocusModeOverlay
        isVisible={true}
        sourceId="ind-1"
        validTargetIds={new Set()}
        targetType={null}
      />,
    )
    unmount()

    const scrollRemovals = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'scroll',
    )
    expect(scrollRemovals.length).toBeGreaterThanOrEqual(1)

    const resizeRemovals = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'resize',
    )
    expect(resizeRemovals.length).toBeGreaterThanOrEqual(1)
  })
})
