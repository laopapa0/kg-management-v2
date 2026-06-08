import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import ConnectionLayer from './ConnectionLayer'

describe('ConnectionLayer', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>
  let rafId = 0
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    rafCallbacks = new Map()
    rafId = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = ++rafId
      rafCallbacks.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id)
    })

    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('does not render when sourceId is null', () => {
    const { container } = render(<ConnectionLayer sourceId={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders fixed SVG layer when sourceId is provided', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const svg = screen.getByTestId('connection-layer')
    expect(svg.tagName).toBe('svg')
    expect(svg).toHaveClass('fixed', 'inset-0', 'pointer-events-none')
  })

  it('renders arrow marker definition', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const marker = document.getElementById('conn-arrow')
    expect(marker).toBeInTheDocument()
    expect(marker).toHaveAttribute('markerWidth', '8')
    expect(marker).toHaveAttribute('markerHeight', '6')
  })

  it('renders path with ant-line animation class', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const path = screen.getByTestId('connection-line-path')
    expect(path.tagName).toBe('path')
    expect(path).toHaveAttribute('stroke', '#64748B')
    expect(path).toHaveAttribute('stroke-width', '2.5')
    expect(path).toHaveAttribute('stroke-dasharray', '6 4')
    expect(path).toHaveAttribute('fill', 'none')
    expect(path).toHaveAttribute('marker-end', 'url(#conn-arrow)')
    expect(path).toHaveClass('animate-ant-line')
  })

  it('turns red and stops ant-line when hovering invalid target', () => {
    const { rerender } = render(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId="invalid-target"
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    const path = screen.getByTestId('connection-line-path')
    expect(path).toHaveAttribute('stroke', '#EF4444')
    expect(path).not.toHaveClass('animate-ant-line')
  })

  it('keeps default color and ant-line when hovering valid target', () => {
    const { rerender } = render(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId="valid-1"
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    const path = screen.getByTestId('connection-line-path')
    expect(path).toHaveAttribute('stroke', '#22C55E')
    expect(path).toHaveClass('animate-ant-line')
  })

  it('restores default color when hover target is cleared', () => {
    const { rerender } = render(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId="invalid-target"
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    const path = screen.getByTestId('connection-line-path')
    expect(path).toHaveAttribute('stroke', '#EF4444')

    rerender(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId={null}
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    expect(path).toHaveAttribute('stroke', '#64748B')
    expect(path).toHaveClass('animate-ant-line')
  })

  it('turns green and thickens stroke when hovering valid target', () => {
    render(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId="valid-1"
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    const path = screen.getByTestId('connection-line-path')
    expect(path).toHaveAttribute('stroke', '#22C55E')
    expect(path).toHaveAttribute('stroke-width', '3')
    expect(path).toHaveClass('animate-ant-line')
  })

  it('keeps ant-line class but speeds up animation on valid hover', () => {
    render(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId="valid-1"
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    const path = screen.getByTestId('connection-line-path')
    expect(path).toHaveClass('animate-ant-line')
    expect(path).toHaveStyle({ animationDuration: '0.3s' })
  })

  it('registers mousemove and scroll listeners on mount', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const mousemoveCalls = addEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    )
    expect(mousemoveCalls.length).toBeGreaterThanOrEqual(1)

    const scrollCalls = addEventListenerSpy.mock.calls.filter(
      ([type, _, opts]) => type === 'scroll' && opts?.passive === true,
    )
    expect(scrollCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('removes listeners on unmount', () => {
    const { unmount } = render(<ConnectionLayer sourceId="test-source" />)
    unmount()

    const mousemoveRemovals = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    )
    expect(mousemoveRemovals.length).toBeGreaterThanOrEqual(1)

    const scrollRemovals = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'scroll',
    )
    expect(scrollRemovals.length).toBeGreaterThanOrEqual(1)
  })

  it('cancels animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<ConnectionLayer sourceId="test-source" />)
    unmount()
    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })
})
