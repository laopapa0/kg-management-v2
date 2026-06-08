import { createPathD } from './connectionGeometry'
import type { Point } from './connectionGeometry'

export { type Point }

export interface ViewportRect {
  left: number
  top: number
  right: number
  bottom: number
}

export type RenderStrategy = 'full' | 'clipped' | 'degraded'

export function getRenderStrategy(count: number): RenderStrategy {
  if (count <= 50) return 'full'
  if (count <= 200) return 'clipped'
  return 'degraded'
}

export function isInViewport(point: Point, viewport: ViewportRect): boolean {
  return (
    point.x >= viewport.left &&
    point.x <= viewport.right &&
    point.y >= viewport.top &&
    point.y <= viewport.bottom
  )
}

export function roundToTwoDecimals(n: number): number {
  return Math.round(n * 100) / 100
}

export function createOptimizedPathD(start: Point, end: Point): string {
  const roundedStart = {
    x: roundToTwoDecimals(start.x),
    y: roundToTwoDecimals(start.y),
  }
  const roundedEnd = {
    x: roundToTwoDecimals(end.x),
    y: roundToTwoDecimals(end.y),
  }
  return createPathD(roundedStart, roundedEnd)
}

export function getViewportRect(): ViewportRect {
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  }
}

export class ViewportFilter {
  private elements = new Map<string, HTMLElement>()

  register(id: string, el: HTMLElement): void {
    this.elements.set(id, el)
  }

  unregister(id: string): void {
    this.elements.delete(id)
  }

  has(id: string): boolean {
    return this.elements.has(id)
  }

  getVisibleIds(viewport: ViewportRect): string[] {
    const result: string[] = []
    for (const [id, el] of this.elements) {
      const rect = el.getBoundingClientRect()
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }
      if (isInViewport(center, viewport)) {
        result.push(id)
      }
    }
    return result
  }

  destroy(): void {
    this.elements.clear()
  }
}

/** Abstract renderer interface — reserved for future SVG / Canvas switching */
export interface ConnectionRenderer {
  render(connections: Array<{ sourceId: string; targetId: string }>): void
  destroy(): void
}
