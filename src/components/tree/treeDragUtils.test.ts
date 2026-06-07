import { describe, it, expect } from 'vitest'
import { getDropPosition } from './treeDragUtils'

describe('getDropPosition', () => {
  it('returns before when active center is above target center by more than threshold', () => {
    const activeRect = { top: 0, height: 20 }
    const overRect = { top: 30, height: 20 }
    expect(getDropPosition(activeRect, overRect)).toBe('before')
  })

  it('returns after when active center is below target center by more than threshold', () => {
    const activeRect = { top: 60, height: 20 }
    const overRect = { top: 30, height: 20 }
    expect(getDropPosition(activeRect, overRect)).toBe('after')
  })

  it('returns inside when active center is within threshold of target center', () => {
    const activeRect = { top: 29, height: 20 }
    const overRect = { top: 30, height: 20 }
    expect(getDropPosition(activeRect, overRect)).toBe('inside')
  })

  it('returns inside when delta equals threshold exactly', () => {
    // overCenter = 40, activeCenter = 44 (delta = 4)
    const activeRect = { top: 34, height: 20 }
    const overRect = { top: 30, height: 20 }
    expect(getDropPosition(activeRect, overRect, 4)).toBe('inside')
  })

  it('returns inside when delta equals negative threshold exactly', () => {
    // overCenter = 40, activeCenter = 36 (delta = -4)
    const activeRect = { top: 26, height: 20 }
    const overRect = { top: 30, height: 20 }
    expect(getDropPosition(activeRect, overRect, 4)).toBe('inside')
  })

  it('uses custom threshold when provided', () => {
    const activeRect = { top: 20, height: 20 }
    const overRect = { top: 30, height: 20 }
    // delta = -10, with threshold 8 → before
    expect(getDropPosition(activeRect, overRect, 8)).toBe('before')
    // delta = -10, with threshold 12 → inside
    expect(getDropPosition(activeRect, overRect, 12)).toBe('inside')
  })
})
