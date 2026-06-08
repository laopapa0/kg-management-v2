import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SourceAnchorMarker from './SourceAnchorMarker'

describe('SourceAnchorMarker', () => {
  let observerCallback: IntersectionObserverCallback | null = null
  let observeMock: ReturnType<typeof vi.fn>
  let unobserveMock: ReturnType<typeof vi.fn>
  let disconnectMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    observeMock = vi.fn()
    unobserveMock = vi.fn()
    disconnectMock = vi.fn()

    global.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
      observe = observeMock
      unobserve = unobserveMock
      disconnect = disconnectMock
    } as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.restoreAllMocks()
    observerCallback = null
  })

  it('renders anchor when source element is not visible', async () => {
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source')
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source" onClick={vi.fn()} />)

    // Trigger IntersectionObserver callback with not-visible state
    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: false, target: sourceEl } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(screen.getByTestId('source-anchor-marker')).toBeInTheDocument()

    document.body.removeChild(sourceEl)
  })

  it('positions anchor on top edge when source scrolled above viewport', async () => {
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-top')
    vi.spyOn(sourceEl, 'getBoundingClientRect').mockReturnValue({
      top: -100, left: 200, right: 250, bottom: -70,
      width: 50, height: 30, x: 200, y: -100, toJSON: () => {},
    } as DOMRect)
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source-top" onClick={vi.fn()} />)

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: false, target: sourceEl } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    const anchor = screen.getByTestId('source-anchor-marker')
    expect(anchor).toHaveAttribute('data-edge', 'top')

    document.body.removeChild(sourceEl)
  })

  it('positions anchor on right edge when source scrolled right of viewport', async () => {
    const originalWidth = window.innerWidth
    const originalHeight = window.innerHeight
    vi.stubGlobal('innerWidth', 1024)
    vi.stubGlobal('innerHeight', 768)

    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-right')
    vi.spyOn(sourceEl, 'getBoundingClientRect').mockReturnValue({
      top: 200, left: 1100, right: 1150, bottom: 230,
      width: 50, height: 30, x: 1100, y: 200, toJSON: () => {},
    } as DOMRect)
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source-right" onClick={vi.fn()} />)

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: false, target: sourceEl } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    const anchor = screen.getByTestId('source-anchor-marker')
    expect(anchor).toHaveAttribute('data-edge', 'right')

    document.body.removeChild(sourceEl)
    vi.stubGlobal('innerWidth', originalWidth)
    vi.stubGlobal('innerHeight', originalHeight)
  })

  it('does not render anchor when source element is visible', async () => {
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-visible')
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source-visible" onClick={vi.fn()} />)

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true, target: sourceEl } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(screen.queryByTestId('source-anchor-marker')).not.toBeInTheDocument()

    document.body.removeChild(sourceEl)
  })

  it('calls onClick when anchor is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-click')
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source-click" onClick={onClick} />)

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: false, target: sourceEl } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    const anchor = screen.getByTestId('source-anchor-marker')
    await user.click(anchor)

    expect(onClick).toHaveBeenCalledTimes(1)

    document.body.removeChild(sourceEl)
  })

  it('observes the source element on mount', async () => {
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-observe')
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source-observe" onClick={vi.fn()} />)

    await waitFor(() => {
      expect(observeMock).toHaveBeenCalledWith(sourceEl)
    })

    document.body.removeChild(sourceEl)
  })

  it('disconnects observer on unmount', async () => {
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-unmount')
    document.body.appendChild(sourceEl)

    const { unmount } = render(
      <SourceAnchorMarker sourceId="test-source-unmount" onClick={vi.fn()} />,
    )

    unmount()

    expect(disconnectMock).toHaveBeenCalledTimes(1)

    document.body.removeChild(sourceEl)
  })

  it('displays source name in tooltip when available', async () => {
    const sourceEl = document.createElement('div')
    sourceEl.setAttribute('data-indicator-id', 'test-source-name')
    sourceEl.textContent = '指标名称'
    document.body.appendChild(sourceEl)

    render(<SourceAnchorMarker sourceId="test-source-name" onClick={vi.fn()} />)

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: false, target: sourceEl } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    const anchor = screen.getByTestId('source-anchor-marker')
    expect(anchor).toHaveAttribute('title', '指标名称')

    document.body.removeChild(sourceEl)
  })
})
