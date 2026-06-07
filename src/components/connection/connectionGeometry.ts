export interface Point {
  x: number
  y: number
}

export function getElementCenter(el: HTMLElement): Point {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

export function createPathD(start: Point, end: Point): string {
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
}
