import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import PersistentConnectionLayer from './PersistentConnectionLayer'

describe('PersistentConnectionLayer', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    cleanup()
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
    document.querySelectorAll('.test-cleanup').forEach((el) => el.remove())
  })

  it('does not render when connections is empty', () => {
    const { container } = render(<PersistentConnectionLayer connections={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders fixed SVG layer when connections are provided', () => {
    render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

    const svg = screen.getByTestId('persistent-connection-layer')
    expect(svg.tagName).toBe('svg')
    expect(svg).toHaveClass('fixed', 'inset-0', 'pointer-events-none')
  })

  it('renders persistent connection lines', () => {
    render(
      <PersistentConnectionLayer
        connections={[
          { sourceId: 'src-1', targetId: 'tree-1' },
          { sourceId: 'src-2', targetId: 'tag-1' },
        ]}
      />,
    )

    const lines = screen.getAllByTestId('persistent-connection-line')
    expect(lines).toHaveLength(2)
    lines.forEach((line) => {
      expect(line).toHaveAttribute('stroke', 'var(--dark-conn-line-valid)')
      expect(line).toHaveAttribute('stroke-width', '2')
      expect(line).toHaveAttribute('fill', 'none')
    })
  })

  it('registers scroll and resize listeners on mount', () => {
    render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

    const scrollCalls = addEventListenerSpy.mock.calls.filter(([type]) => type === 'scroll')
    const resizeCalls = addEventListenerSpy.mock.calls.filter(([type]) => type === 'resize')
    expect(scrollCalls.length).toBeGreaterThanOrEqual(1)
    expect(resizeCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('removes scroll and resize listeners on unmount', () => {
    const { unmount } = render(
      <PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />,
    )
    unmount()

    const scrollRemovals = removeEventListenerSpy.mock.calls.filter(([type]) => type === 'scroll')
    const resizeRemovals = removeEventListenerSpy.mock.calls.filter(([type]) => type === 'resize')
    expect(scrollRemovals.length).toBeGreaterThanOrEqual(1)
    expect(resizeRemovals.length).toBeGreaterThanOrEqual(1)
  })

  it('does not register rAF or mousemove listeners', () => {
    render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

    const rafCalls = addEventListenerSpy.mock.calls.filter(([type]) => type === 'requestAnimationFrame')
    const mousemoveCalls = addEventListenerSpy.mock.calls.filter(([type]) => type === 'mousemove')
    expect(rafCalls).toHaveLength(0)
    expect(mousemoveCalls).toHaveLength(0)
  })

  it('updates path d when source and target elements exist', () => {
    const sourceEl = document.createElement('div')
    sourceEl.classList.add('test-cleanup')
    sourceEl.setAttribute('data-indicator-id', 'src-1')
    sourceEl.style.position = 'absolute'
    sourceEl.style.left = '0px'
    sourceEl.style.top = '0px'
    sourceEl.style.width = '10px'
    sourceEl.style.height = '10px'
    document.body.appendChild(sourceEl)

    sourceEl.getBoundingClientRect = vi.fn(() => ({
      x: 0, y: 0, width: 10, height: 10,
      top: 0, left: 0, right: 10, bottom: 10, toJSON: () => '',
    }))

    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-node-id', 'tree-1')
    targetEl.style.position = 'absolute'
    targetEl.style.left = '100px'
    targetEl.style.top = '100px'
    targetEl.style.width = '10px'
    targetEl.style.height = '10px'
    document.body.appendChild(targetEl)

    targetEl.getBoundingClientRect = vi.fn(() => ({
      x: 100, y: 100, width: 10, height: 10,
      top: 100, left: 100, right: 110, bottom: 110, toJSON: () => '',
    }))

    render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

    const line = screen.getByTestId('persistent-connection-line')
    const d = line.getAttribute('d')
    expect(d).toContain('M')
    expect(d).toContain('L')

    document.body.removeChild(sourceEl)
    document.body.removeChild(targetEl)
  })

  it('matches tag target via data-tag-id selector', () => {
    const sourceEl = document.createElement('div')
    sourceEl.classList.add('test-cleanup')
    sourceEl.setAttribute('data-indicator-id', 'src-1')
    sourceEl.style.position = 'absolute'
    sourceEl.style.left = '0px'
    sourceEl.style.top = '0px'
    sourceEl.style.width = '10px'
    sourceEl.style.height = '10px'
    document.body.appendChild(sourceEl)

    sourceEl.getBoundingClientRect = vi.fn(() => ({
      x: 0, y: 0, width: 10, height: 10,
      top: 0, left: 0, right: 10, bottom: 10, toJSON: () => '',
    }))

    const targetEl = document.createElement('button')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-tag-id', 'tag-1')
    targetEl.style.position = 'absolute'
    targetEl.style.left = '50px'
    targetEl.style.top = '50px'
    targetEl.style.width = '10px'
    targetEl.style.height = '10px'
    document.body.appendChild(targetEl)

    targetEl.getBoundingClientRect = vi.fn(() => ({
      x: 50, y: 50, width: 10, height: 10,
      top: 50, left: 50, right: 60, bottom: 60, toJSON: () => '',
    }))

    render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tag-1' }]} />)

    const line = screen.getByTestId('persistent-connection-line')
    expect(line.getAttribute('d')).toContain('M 5 5 L 55 55')

    document.body.removeChild(sourceEl)
    document.body.removeChild(targetEl)
  })

  it('matches rule target via data-rule-id selector', () => {
    const sourceEl = document.createElement('div')
    sourceEl.classList.add('test-cleanup')
    sourceEl.setAttribute('data-indicator-id', 'src-1')
    sourceEl.style.position = 'absolute'
    sourceEl.style.left = '0px'
    sourceEl.style.top = '0px'
    sourceEl.style.width = '10px'
    sourceEl.style.height = '10px'
    document.body.appendChild(sourceEl)

    sourceEl.getBoundingClientRect = vi.fn(() => ({
      x: 0, y: 0, width: 10, height: 10,
      top: 0, left: 0, right: 10, bottom: 10, toJSON: () => '',
    }))

    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-rule-id', 'rule-1')
    targetEl.style.position = 'absolute'
    targetEl.style.left = '200px'
    targetEl.style.top = '200px'
    targetEl.style.width = '10px'
    sourceEl.style.height = '10px'
    document.body.appendChild(targetEl)

    targetEl.getBoundingClientRect = vi.fn(() => ({
      x: 200, y: 200, width: 10, height: 10,
      top: 200, left: 200, right: 210, bottom: 210, toJSON: () => '',
    }))

    render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'rule-1' }]} />)

    const line = screen.getByTestId('persistent-connection-line')
    expect(line.getAttribute('d')).toContain('M 5 5 L 205 205')

    document.body.removeChild(sourceEl)
    document.body.removeChild(targetEl)
  })
})
