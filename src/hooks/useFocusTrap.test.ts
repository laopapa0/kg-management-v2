import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRef } from 'react'
import { useFocusTrap } from './useFocusTrap'

describe('useFocusTrap', () => {
  let wrapper: HTMLDivElement
  let outsideBtn: HTMLButtonElement

  beforeEach(() => {
    wrapper = document.createElement('div')
    wrapper.innerHTML = `
      <button id="btn-1">First</button>
      <button id="btn-2">Second</button>
      <input id="input-1" />
      <button id="btn-3">Third</button>
    `
    document.body.appendChild(wrapper)

    outsideBtn = document.createElement('button')
    outsideBtn.id = 'outside-btn'
    outsideBtn.textContent = 'Outside'
    document.body.appendChild(outsideBtn)
  })

  afterEach(() => {
    document.body.removeChild(wrapper)
    document.body.removeChild(outsideBtn)
  })

  function setup(enabled: boolean) {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(wrapper)
      useFocusTrap(ref, { enabled })
      return ref
    })
    return result
  }

  it('does not intercept Tab when disabled', () => {
    setup(false)
    const btn1 = document.getElementById('btn-1') as HTMLButtonElement

    act(() => {
      btn1.focus()
    })
    expect(document.activeElement).toBe(btn1)

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    act(() => {
      document.dispatchEvent(tabEvent)
    })

    // Focus should remain on btn1 since trap is disabled and no real Tab occurs in jsdom
    expect(document.activeElement).toBe(btn1)
  })

  it('cycles Tab forward within the container when enabled', () => {
    setup(true)
    const btn1 = document.getElementById('btn-1') as HTMLButtonElement
    const btn3 = document.getElementById('btn-3') as HTMLButtonElement

    act(() => {
      btn3.focus()
    })
    expect(document.activeElement).toBe(btn3)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    })

    expect(document.activeElement).toBe(btn1)
  })

  it('cycles Shift+Tab backward within the container when enabled', () => {
    setup(true)
    const btn1 = document.getElementById('btn-1') as HTMLButtonElement
    const btn3 = document.getElementById('btn-3') as HTMLButtonElement

    act(() => {
      btn1.focus()
    })
    expect(document.activeElement).toBe(btn1)

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
      )
    })

    expect(document.activeElement).toBe(btn3)
  })

  it('moves Tab forward normally between elements inside container', () => {
    setup(true)
    const btn1 = document.getElementById('btn-1') as HTMLButtonElement
    const btn2 = document.getElementById('btn-2') as HTMLButtonElement

    act(() => {
      btn1.focus()
    })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    })

    expect(document.activeElement).toBe(btn2)
  })

  it('prevents Tab from leaving the container', () => {
    setup(true)
    const btn3 = document.getElementById('btn-3') as HTMLButtonElement
    const outside = document.getElementById('outside-btn') as HTMLButtonElement

    act(() => {
      btn3.focus()
    })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    })

    expect(document.activeElement).not.toBe(outside)
    expect(document.activeElement).toBe(document.getElementById('btn-1'))
  })

  it('returns focus to previously focused element when disabled', () => {
    const outside = document.getElementById('outside-btn') as HTMLButtonElement
    outside.focus()
    expect(document.activeElement).toBe(outside)

    const { rerender } = renderHook(
      ({ enabled }) => {
        const ref = useRef<HTMLDivElement>(wrapper)
        useFocusTrap(ref, { enabled })
        return ref
      },
      { initialProps: { enabled: true } },
    )

    const btn1 = document.getElementById('btn-1') as HTMLButtonElement
    // Focus should have moved to first focusable element
    expect(document.activeElement).toBe(btn1)

    // Disable trap — focus should return to outside button
    rerender({ enabled: false })

    expect(document.activeElement).toBe(outside)
  })

  it('does not throw when container is empty', () => {
    const emptyWrapper = document.createElement('div')
    document.body.appendChild(emptyWrapper)

    expect(() => {
      renderHook(() => {
        const ref = useRef<HTMLDivElement>(emptyWrapper)
        useFocusTrap(ref, { enabled: true })
      })
    }).not.toThrow()

    document.body.removeChild(emptyWrapper)
  })

  it('ignores disabled elements', () => {
    const disabledBtn = document.createElement('button')
    disabledBtn.disabled = true
    disabledBtn.textContent = 'Disabled'
    wrapper.appendChild(disabledBtn)

    setup(true)
    const btn3 = document.getElementById('btn-3') as HTMLButtonElement
    const btn1 = document.getElementById('btn-1') as HTMLButtonElement

    act(() => {
      btn3.focus()
    })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    })

    // Should cycle to first, not disabled button
    expect(document.activeElement).toBe(btn1)
  })

  it('ignores elements with tabindex="-1"', () => {
    const negativeTabBtn = document.createElement('div')
    negativeTabBtn.tabIndex = -1
    negativeTabBtn.textContent = 'Negative tab'
    wrapper.appendChild(negativeTabBtn)

    setup(true)
    const btn3 = document.getElementById('btn-3') as HTMLButtonElement
    const btn1 = document.getElementById('btn-1') as HTMLButtonElement

    act(() => {
      btn3.focus()
    })

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    })

    // Should cycle to first, not negative tabindex element
    expect(document.activeElement).toBe(btn1)
  })

  it('handles single focusable element without error', () => {
    const singleWrapper = document.createElement('div')
    const onlyBtn = document.createElement('button')
    onlyBtn.textContent = 'Only'
    singleWrapper.appendChild(onlyBtn)
    document.body.appendChild(singleWrapper)

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(singleWrapper)
      useFocusTrap(ref, { enabled: true })
    })

    act(() => {
      onlyBtn.focus()
    })

    // Should not throw and focus stays on the only element
    expect(() =>
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      }),
    ).not.toThrow()
    expect(document.activeElement).toBe(onlyBtn)

    document.body.removeChild(singleWrapper)
  })
})
