export function findTargetElement(targetId: string): HTMLElement | null {
  return (
    document.querySelector(`[data-node-id="${targetId}"]`) ||
    document.querySelector(`[data-tag-id="${targetId}"]`) ||
    document.querySelector(`[data-rule-id="${targetId}"]`) ||
    document.querySelector(`[data-indicator-id="${targetId}"]`)
  ) as HTMLElement | null
}
