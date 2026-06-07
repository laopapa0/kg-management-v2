import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFocusZone } from './useFocusZone'

describe('useFocusZone', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('returns null when no focusable element is focused', () => {
    const { result } = renderHook(() => useFocusZone())
    expect(result.current).toBeNull()
  })

  it('detects indicator zone when a card inside data-focus-zone="indicator" is focused', () => {
    container.innerHTML = `
      <div data-focus-zone="indicator">
        <button data-testid="focus-btn">Card</button>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      container.querySelector('button')!.focus()
    })

    expect(result.current).toBe('indicator')
  })

  it('detects tag zone when a tag pill inside data-focus-zone="tag" is focused', () => {
    container.innerHTML = `
      <div data-focus-zone="tag">
        <button data-testid="focus-btn">Tag</button>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      container.querySelector('button')!.focus()
    })

    expect(result.current).toBe('tag')
  })

  it('detects tree zone when a tree toggle inside data-focus-zone="tree" is focused', () => {
    container.innerHTML = `
      <div data-focus-zone="tree">
        <button data-testid="focus-btn">Toggle</button>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      container.querySelector('button')!.focus()
    })

    expect(result.current).toBe('tree')
  })

  it('detects rule zone when a rule row inside data-focus-zone="rule" is focused', () => {
    container.innerHTML = `
      <div data-focus-zone="rule">
        <button data-testid="focus-btn">Rule</button>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      container.querySelector('button')!.focus()
    })

    expect(result.current).toBe('rule')
  })

  it('updates zone when focus moves between zones', () => {
    container.innerHTML = `
      <div data-focus-zone="indicator">
        <button id="btn-indicator">Indicator</button>
      </div>
      <div data-focus-zone="tag">
        <button id="btn-tag">Tag</button>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      document.getElementById('btn-indicator')!.focus()
    })
    expect(result.current).toBe('indicator')

    act(() => {
      document.getElementById('btn-tag')!.focus()
    })
    expect(result.current).toBe('tag')
  })

  it('returns null when focused element is outside any zone', () => {
    container.innerHTML = `
      <div data-focus-zone="indicator">
        <button id="btn-inside">Inside</button>
      </div>
      <button id="btn-outside">Outside</button>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      document.getElementById('btn-outside')!.focus()
    })

    expect(result.current).toBeNull()
  })

  it('ignores invalid data-focus-zone values', () => {
    container.innerHTML = `
      <div data-focus-zone="invalid">
        <button id="btn">Button</button>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      document.getElementById('btn')!.focus()
    })

    expect(result.current).toBeNull()
  })

  it('finds the closest ancestor zone when nested', () => {
    container.innerHTML = `
      <div data-focus-zone="indicator">
        <div data-focus-zone="tag">
          <button id="btn">Nested</button>
        </div>
      </div>
    `
    const { result } = renderHook(() => useFocusZone())

    act(() => {
      document.getElementById('btn')!.focus()
    })

    expect(result.current).toBe('tag')
  })
})
