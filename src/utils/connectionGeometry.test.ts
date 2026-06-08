import { describe, it, expect, vi } from 'vitest'
import { getElementCenter, createPathD } from './connectionGeometry'

describe('getElementCenter', () => {
  it('returns center coordinates of an element', () => {
    const el = document.createElement('div')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 200,
      width: 50,
      height: 30,
      right: 150,
      bottom: 230,
      x: 100,
      y: 200,
      toJSON: () => {},
    } as DOMRect)

    const center = getElementCenter(el)
    expect(center).toEqual({ x: 125, y: 215 })
  })
})

describe('createPathD', () => {
  it('creates a straight line path', () => {
    const d = createPathD({ x: 100, y: 200 }, { x: 300, y: 400 })
    expect(d).toBe('M 100 200 L 300 400')
  })

  it('creates a path with decimal coordinates', () => {
    const d = createPathD({ x: 10.5, y: 20.25 }, { x: 30.75, y: 40.125 })
    expect(d).toBe('M 10.5 20.25 L 30.75 40.125')
  })
})
