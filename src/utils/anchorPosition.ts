export type Edge = 'top' | 'right' | 'bottom' | 'left'

export function getEdgePosition(
  rect: Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'>,
  viewportWidth: number,
  viewportHeight: number,
): { edge: Edge; offset: number } {
  if (rect.bottom < 0) {
    return {
      edge: 'top',
      offset: Math.max(16, Math.min(viewportWidth - 16, rect.left + rect.width / 2)),
    }
  }
  if (rect.top > viewportHeight) {
    return {
      edge: 'bottom',
      offset: Math.max(16, Math.min(viewportWidth - 16, rect.left + rect.width / 2)),
    }
  }
  if (rect.right < 0) {
    return {
      edge: 'left',
      offset: Math.max(16, Math.min(viewportHeight - 16, rect.top + rect.height / 2)),
    }
  }
  return {
    edge: 'right',
    offset: Math.max(16, Math.min(viewportHeight - 16, rect.top + rect.height / 2)),
  }
}
