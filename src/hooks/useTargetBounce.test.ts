import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTargetBounce } from './useTargetBounce'

describe('useTargetBounce', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.querySelectorAll('.test-cleanup').forEach((el) => el.remove())
  })

  it('adds bounce class to tree target element on connection-confirmed', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-node-id', 'tree-1')
    document.body.appendChild(targetEl)

    renderHook(() => useTargetBounce())

    act(() => {
      window.dispatchEvent(
        new CustomEvent('connection-confirmed', {
          detail: { sourceId: 'src-1', targetId: 'tree-1', targetType: 'tree' },
        }),
      )
    })

    expect(targetEl).toHaveClass('animate-target-bounce')

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(targetEl).not.toHaveClass('animate-target-bounce')

    document.body.removeChild(targetEl)
  })

  it('adds bounce class to tag target element', () => {
    const targetEl = document.createElement('button')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-tag-id', 'tag-1')
    document.body.appendChild(targetEl)

    renderHook(() => useTargetBounce())

    act(() => {
      window.dispatchEvent(
        new CustomEvent('connection-confirmed', {
          detail: { sourceId: 'src-1', targetId: 'tag-1', targetType: 'tag' },
        }),
      )
    })

    expect(targetEl).toHaveClass('animate-target-bounce')
    document.body.removeChild(targetEl)
  })

  it('adds bounce class to rule target element', () => {
    const targetEl = document.createElement('div')
    targetEl.classList.add('test-cleanup')
    targetEl.setAttribute('data-rule-id', 'rule-1')
    document.body.appendChild(targetEl)

    renderHook(() => useTargetBounce())

    act(() => {
      window.dispatchEvent(
        new CustomEvent('connection-confirmed', {
          detail: { sourceId: 'src-1', targetId: 'rule-1', targetType: 'rule' },
        }),
      )
    })

    expect(targetEl).toHaveClass('animate-target-bounce')
    document.body.removeChild(targetEl)
  })
})
