import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      expect(line).toHaveAttribute('stroke', '#3B82F6')
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

  describe('hover interaction', () => {
    function setupConnectionElements() {
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

      return { sourceEl, targetEl }
    }

    it('highlights path on hover with color #7B8CDE and stroke-width 2.5', () => {
      setupConnectionElements()
      render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

      const path = screen.getByTestId('persistent-connection-line')
      expect(path).toHaveAttribute('stroke', '#3B82F6')
      expect(path).toHaveAttribute('stroke-width', '2')

      fireEvent.mouseEnter(path)

      expect(path).toHaveAttribute('stroke', '#7B8CDE')
      expect(path).toHaveAttribute('stroke-width', '2.5')
    })

    it('restores path style on mouse leave', () => {
      setupConnectionElements()
      render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

      const path = screen.getByTestId('persistent-connection-line')

      fireEvent.mouseEnter(path)
      expect(path).toHaveAttribute('stroke', '#7B8CDE')

      fireEvent.mouseLeave(path)
      expect(path).toHaveAttribute('stroke', '#3B82F6')
      expect(path).toHaveAttribute('stroke-width', '2')
    })

    it('shows delete button at midpoint on hover', () => {
      setupConnectionElements()
      render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      const button = screen.getByTestId('delete-connection-button')
      expect(button).toBeInTheDocument()
      // midpoint of (5,5) and (105,105) is (55,55); button is centered: left=45, top=45
      expect(button).toHaveStyle({ left: '45px', top: '45px' })
    })

    it('hides delete button on mouse leave', () => {
      setupConnectionElements()
      render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)
      expect(screen.getByTestId('delete-connection-button')).toBeInTheDocument()

      fireEvent.mouseLeave(path)
      expect(screen.queryByTestId('delete-connection-button')).not.toBeInTheDocument()
    })

    it('calls onDelete with connection when delete button is clicked', () => {
      const onDelete = vi.fn()
      setupConnectionElements()
      render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]}
          onDelete={onDelete}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      fireEvent.click(screen.getByTestId('delete-connection-button'))
      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(onDelete).toHaveBeenCalledWith({ sourceId: 'src-1', targetId: 'tree-1' })
    })

    it('path has pointer-events stroke for hover detection', () => {
      setupConnectionElements()
      render(<PersistentConnectionLayer connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]} />)

      const path = screen.getByTestId('persistent-connection-line')
      expect(path).toHaveStyle({ pointerEvents: 'stroke' })
    })

    it('fades out path over 200ms before removing from DOM', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const onDelete = vi.fn()
      setupConnectionElements()
      const { rerender } = render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]}
          onDelete={onDelete}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      act(() => {
        fireEvent.click(screen.getByTestId('delete-connection-button'))
      })

      // onDelete is called immediately
      expect(onDelete).toHaveBeenCalledTimes(1)

      // Path should still be in DOM immediately after click, fading out
      expect(screen.getByTestId('persistent-connection-line')).toBeInTheDocument()
      const updatedPath = screen.getByTestId('persistent-connection-line')
      expect(updatedPath).toHaveAttribute('opacity', '0')

      // Simulate parent removing connection from props
      rerender(
        <PersistentConnectionLayer
          connections={[]}
          onDelete={onDelete}
        />,
      )

      // Path still rendered because it's in exitingKeys
      expect(screen.getByTestId('persistent-connection-line')).toBeInTheDocument()

      // After 200ms fade-out, exitingKeys is cleared and path is removed
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(screen.queryByTestId('persistent-connection-line')).not.toBeInTheDocument()

      vi.useRealTimers()
    })

    it('clears exiting timers on unmount to avoid setState after unmount', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      setupConnectionElements()
      const { unmount } = render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'tree-1' }]}
          onDelete={vi.fn()}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)
      fireEvent.click(screen.getByTestId('delete-connection-button'))

      unmount()

      // Advance past the 200ms fade-out timer
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Should not log React warning about setState on unmounted component
      const reactWarnings = consoleError.mock.calls.filter(
        (call) =>
          typeof call[0] === 'string' &&
          (call[0].includes('unmounted') || call[0].includes('memory leak')),
      )
      expect(reactWarnings).toHaveLength(0)

      consoleError.mockRestore()
      vi.useRealTimers()
    })
  })

  describe('inline confirm for rule connections', () => {
    function setupRuleConnectionElements() {
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
      targetEl.style.left = '100px'
      targetEl.style.top = '100px'
      targetEl.style.width = '10px'
      targetEl.style.height = '10px'
      document.body.appendChild(targetEl)

      targetEl.getBoundingClientRect = vi.fn(() => ({
        x: 100, y: 100, width: 10, height: 10,
        top: 100, left: 100, right: 110, bottom: 110, toJSON: () => '',
      }))

      return { sourceEl, targetEl }
    }

    it('shows InlineConfirmButton for rule connections when requiresConfirm returns true', () => {
      setupRuleConnectionElements()
      render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'rule-1' }]}
          requiresConfirm={() => true}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      expect(screen.getByTestId('inline-confirm-button')).toBeInTheDocument()
      expect(screen.queryByTestId('delete-connection-button')).not.toBeInTheDocument()
    })

    it('shows regular DeleteConnectionButton for non-rule connections', () => {
      setupRuleConnectionElements()
      render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'rule-1' }]}
          requiresConfirm={() => false}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      expect(screen.getByTestId('delete-connection-button')).toBeInTheDocument()
      expect(screen.queryByTestId('inline-confirm-button')).not.toBeInTheDocument()
    })

    it('requires two clicks on InlineConfirmButton before calling onDelete', async () => {
      const onDelete = vi.fn()
      setupRuleConnectionElements()
      render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'rule-1' }]}
          onDelete={onDelete}
          requiresConfirm={() => true}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      const button = screen.getByTestId('inline-confirm-button')
      await userEvent.click(button) // first click → confirming

      expect(button).toHaveTextContent('确认删除？')
      expect(onDelete).not.toHaveBeenCalled()

      await userEvent.click(button) // second click → confirm
      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(onDelete).toHaveBeenCalledWith({ sourceId: 'src-1', targetId: 'rule-1' })
    })

    it('keeps delete button visible when in confirming state even if mouse leaves', async () => {
      setupRuleConnectionElements()
      render(
        <PersistentConnectionLayer
          connections={[{ sourceId: 'src-1', targetId: 'rule-1' }]}
          requiresConfirm={() => true}
        />,
      )

      const path = screen.getByTestId('persistent-connection-line')
      fireEvent.mouseEnter(path)

      const button = screen.getByTestId('inline-confirm-button')
      await userEvent.click(button) // enter confirming state

      fireEvent.mouseLeave(path)

      // Button should still be visible because we're in confirming state
      await waitFor(() => {
        expect(screen.queryByTestId('inline-confirm-button')).toBeInTheDocument()
      })
    })
  })
})
