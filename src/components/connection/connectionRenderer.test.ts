import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRenderStrategy,
  isInViewport,
  roundToTwoDecimals,
  createOptimizedPathD,
  ViewportFilter,
  getViewportRect,
  type ViewportRect,
} from './connectionRenderer'

describe('getRenderStrategy', () => {
  it('returns full for 0 connections', () => {
    expect(getRenderStrategy(0)).toBe('full')
  })

  it('returns full for up to 50 connections', () => {
    expect(getRenderStrategy(1)).toBe('full')
    expect(getRenderStrategy(50)).toBe('full')
  })

  it('returns clipped for 51-200 connections', () => {
    expect(getRenderStrategy(51)).toBe('clipped')
    expect(getRenderStrategy(100)).toBe('clipped')
    expect(getRenderStrategy(200)).toBe('clipped')
  })

  it('returns degraded for over 200 connections', () => {
    expect(getRenderStrategy(201)).toBe('degraded')
    expect(getRenderStrategy(1000)).toBe('degraded')
  })
})

describe('isInViewport', () => {
  const viewport: ViewportRect = { left: 0, top: 0, right: 1000, bottom: 800 }

  it('returns true for point inside viewport', () => {
    expect(isInViewport({ x: 500, y: 400 }, viewport)).toBe(true)
  })

  it('returns false for point outside on left', () => {
    expect(isInViewport({ x: -1, y: 400 }, viewport)).toBe(false)
  })

  it('returns false for point outside on right', () => {
    expect(isInViewport({ x: 1001, y: 400 }, viewport)).toBe(false)
  })

  it('returns false for point outside on top', () => {
    expect(isInViewport({ x: 500, y: -1 }, viewport)).toBe(false)
  })

  it('returns false for point outside on bottom', () => {
    expect(isInViewport({ x: 500, y: 801 }, viewport)).toBe(false)
  })

  it('returns true for point exactly on boundary', () => {
    expect(isInViewport({ x: 0, y: 0 }, viewport)).toBe(true)
    expect(isInViewport({ x: 1000, y: 800 }, viewport)).toBe(true)
  })
})

describe('roundToTwoDecimals', () => {
  it('rounds up at 5', () => {
    expect(roundToTwoDecimals(123.455)).toBe(123.46)
  })

  it('rounds down below 5', () => {
    expect(roundToTwoDecimals(123.454)).toBe(123.45)
  })

  it('handles integers', () => {
    expect(roundToTwoDecimals(100)).toBe(100)
  })

  it('handles negative numbers', () => {
    expect(roundToTwoDecimals(-123.456)).toBe(-123.46)
  })

  it('handles zero', () => {
    expect(roundToTwoDecimals(0)).toBe(0)
  })
})

describe('createOptimizedPathD', () => {
  it('rounds coordinates to two decimal places', () => {
    const result = createOptimizedPathD(
      { x: 123.4567, y: 789.0123 },
      { x: 456.789, y: 321.6543 },
    )
    expect(result).toBe('M 123.46 789.01 L 456.79 321.65')
  })
})

describe('getViewportRect', () => {
  it('returns window dimensions', () => {
    const rect = getViewportRect()
    expect(rect.left).toBe(0)
    expect(rect.top).toBe(0)
    expect(rect.right).toBe(window.innerWidth)
    expect(rect.bottom).toBe(window.innerHeight)
  })
})

describe('ViewportFilter', () => {
  let filter: ViewportFilter

  beforeEach(() => {
    filter = new ViewportFilter()
  })

  afterEach(() => {
    filter.destroy()
  })

  it('registers and unregisters elements', () => {
    const el = document.createElement('div')
    filter.register('conn-1', el)
    expect(filter.has('conn-1')).toBe(true)
    filter.unregister('conn-1')
    expect(filter.has('conn-1')).toBe(false)
  })

  it('returns visible ids for elements in viewport', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    el.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      width: 50,
      height: 50,
      right: 150,
      bottom: 150,
      x: 100,
      y: 100,
      toJSON: () => {},
    }))

    filter.register('conn-1', el)
    const visible = filter.getVisibleIds({ left: 0, top: 0, right: 1000, bottom: 800 })
    expect(visible).toContain('conn-1')

    document.body.removeChild(el)
  })

  it('excludes ids for elements outside viewport', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    el.getBoundingClientRect = vi.fn(() => ({
      left: -200,
      top: 100,
      width: 50,
      height: 50,
      right: -150,
      bottom: 150,
      x: -200,
      y: 100,
      toJSON: () => {},
    }))

    filter.register('conn-2', el)
    const visible = filter.getVisibleIds({ left: 0, top: 0, right: 1000, bottom: 800 })
    expect(visible).not.toContain('conn-2')

    document.body.removeChild(el)
  })

  it('clears all registrations on destroy', () => {
    const el = document.createElement('div')
    filter.register('conn-1', el)
    filter.destroy()
    expect(filter.has('conn-1')).toBe(false)
  })
})
