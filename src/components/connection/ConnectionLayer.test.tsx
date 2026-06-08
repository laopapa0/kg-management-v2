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

  it('renders reusable arrow marker definitions', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const defaultMarker = document.getElementById('conn-arrow')
    expect(defaultMarker).toBeInTheDocument()
    expect(defaultMarker).toHaveAttribute('markerWidth', '8')
    expect(defaultMarker).toHaveAttribute('markerHeight', '6')

    const invalidMarker = document.getElementById('conn-arrow-invalid')
    expect(invalidMarker).toBeInTheDocument()

    const validMarker = document.getElementById('conn-arrow-valid')
    expect(validMarker).toBeInTheDocument()
  })

  it('renders path with ant-line animation class', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const path = screen.getByTestId('connection-line-path')
    expect(path.tagName).toBe('path')
    expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-default)')
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
    expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-invalid)')
    expect(path).not.toHaveClass('animate-ant-line')
    expect(path).toHaveAttribute('marker-end', 'url(#conn-arrow-invalid)')
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
    expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-valid)')
    expect(path).toHaveClass('animate-ant-line')
    expect(path).toHaveAttribute('marker-end', 'url(#conn-arrow-valid)')
  })

  it('restores default color and marker when hover target is cleared', () => {
    const { rerender } = render(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId="invalid-target"
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    const path = screen.getByTestId('connection-line-path')
    expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-invalid)')
    expect(path).toHaveAttribute('marker-end', 'url(#conn-arrow-invalid)')

    rerender(
      <ConnectionLayer
        sourceId="test-source"
        hoverTargetId={null}
        validTargetIds={new Set(['valid-1'])}
      />,
    )

    expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-default)')
    expect(path).toHaveClass('animate-ant-line')
    expect(path).toHaveAttribute('marker-end', 'url(#conn-arrow)')
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
    expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-valid)')
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

  it('registers mousemove listener on mount', () => {
    render(<ConnectionLayer sourceId="test-source" />)

    const mousemoveCalls = addEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    )
    expect(mousemoveCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('removes mousemove listener on unmount', () => {
    const { unmount } = render(<ConnectionLayer sourceId="test-source" />)
    unmount()

    const mousemoveRemovals = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === 'mousemove',
    )
    expect(mousemoveRemovals.length).toBeGreaterThanOrEqual(1)
  })

  it('cancels animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = render(<ConnectionLayer sourceId="test-source" />)
    unmount()
    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })
})
