import { describe, it, expect } from 'vitest'
import { getEdgePosition } from './anchorPosition'

function makeRect(partial: Partial<DOMRect>): DOMRect {
  return {
    x: partial.left ?? 0,
    y: partial.top ?? 0,
    width: partial.width ?? 0,
    height: partial.height ?? 0,
    top: partial.top ?? 0,
    left: partial.left ?? 0,
    right: partial.right ?? 0,
    bottom: partial.bottom ?? 0,
    toJSON: () => {},
  } as DOMRect
}

describe('getEdgePosition', () => {
  it('detects top edge when element scrolled above viewport', () => {
    const rect = makeRect({ top: -100, left: 200, width: 50, height: 30, bottom: -70, right: 250 })
    const result = getEdgePosition(rect, 800, 600)
    expect(result.edge).toBe('top')
    expect(result.offset).toBe(225) // 200 + 50/2
  })

  it('detects bottom edge when element scrolled below viewport', () => {
    const rect = makeRect({ top: 650, left: 200, width: 50, height: 30, bottom: 680, right: 250 })
    const result = getEdgePosition(rect, 800, 600)
    expect(result.edge).toBe('bottom')
    expect(result.offset).toBe(225)
  })

  it('detects left edge when element scrolled left of viewport', () => {
    const rect = makeRect({ top: 200, left: -100, width: 50, height: 30, bottom: 230, right: -50 })
    const result = getEdgePosition(rect, 800, 600)
    expect(result.edge).toBe('left')
    expect(result.offset).toBe(215) // 200 + 30/2
  })

  it('detects right edge when element scrolled right of viewport', () => {
    const rect = makeRect({ top: 200, left: 850, width: 50, height: 30, bottom: 230, right: 900 })
    const result = getEdgePosition(rect, 800, 600)
    expect(result.edge).toBe('right')
    expect(result.offset).toBe(215)
  })

  it('clamps offset to minimum 16', () => {
    const rect = makeRect({ top: -100, left: 0, width: 10, height: 10, bottom: -90, right: 10 })
    const result = getEdgePosition(rect, 800, 600)
    expect(result.edge).toBe('top')
    expect(result.offset).toBe(16)
  })

  it('clamps offset to viewport boundary minus 16', () => {
    const rect = makeRect({ top: -100, left: 790, width: 50, height: 30, bottom: -70, right: 840 })
    const result = getEdgePosition(rect, 800, 600)
    expect(result.edge).toBe('top')
    expect(result.offset).toBe(784) // 800 - 16
  })
})
