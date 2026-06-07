export type DropPosition = 'before' | 'after' | 'inside'

export function getDropPosition(
  activeRect: { top: number; height: number },
  overRect: { top: number; height: number },
  threshold = 4,
): DropPosition {
  const overCenterY = overRect.top + overRect.height / 2
  const activeCenterY = activeRect.top + activeRect.height / 2
  const delta = activeCenterY - overCenterY

  if (delta < -threshold) return 'before'
  if (delta > threshold) return 'after'
  return 'inside'
}
