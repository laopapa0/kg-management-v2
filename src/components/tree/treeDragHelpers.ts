import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import type { DropPosition } from './treeDragUtils'

export function applyDragOperation(
  indicators: IndicatorAttachment[],
  draggedId: string,
  targetId: string,
  position: DropPosition,
): IndicatorAttachment[] {
  const dragged = indicators.find((i) => i.id === draggedId)
  const target = indicators.find((i) => i.id === targetId)
  if (!dragged || !target || draggedId === targetId) return indicators

  // Prevent moving a node into its own descendant (cycle detection)
  const isDescendant = (parentId: string, childId: string): boolean => {
    const children = indicators.filter((i) => i.treeParentId === parentId)
    return children.some((c) => c.id === childId || isDescendant(c.id, childId))
  }
  if (isDescendant(draggedId, targetId)) return indicators

  const newParentId = position === 'inside' ? targetId : target.treeParentId

  return indicators.map((i) =>
    i.id === draggedId ? { ...i, treeParentId: newParentId } : i,
  )
}
