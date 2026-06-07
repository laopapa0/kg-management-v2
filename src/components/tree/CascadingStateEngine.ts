import type { TagNode } from '@/models/indicatorAttachmentModel'

export interface CascadingSelection {
  /** 完全选中的节点 ID */
  selected: Set<string>
  /** 半选中的节点 ID（部分子节点被选中） */
  partial: Set<string>
}

function buildChildrenMap(nodes: TagNode[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const node of nodes) {
    if (node.parentId) {
      const set = map.get(node.parentId) ?? new Set<string>()
      set.add(node.id)
      map.set(node.parentId, set)
    }
  }
  return map
}

function buildParentMap(nodes: TagNode[]): Map<string, string | undefined> {
  const map = new Map<string, string | undefined>()
  for (const node of nodes) {
    map.set(node.id, node.parentId)
  }
  return map
}

function computeDepths(nodes: TagNode[], parentMap: Map<string, string | undefined>): Map<string, number> {
  const depths = new Map<string, number>()

  function getDepth(id: string): number {
    if (depths.has(id)) return depths.get(id)!
    const parentId = parentMap.get(id)
    const depth = parentId ? getDepth(parentId) + 1 : 0
    depths.set(id, depth)
    return depth
  }

  for (const node of nodes) {
    getDepth(node.id)
  }

  return depths
}

/**
 * 根据当前 selected 集合重新计算所有节点的 selected + partial 状态。
 * 规则：
 * - 若某节点的所有子节点都 selected，则该节点也 selected
 * - 若某节点的部分子节点 selected 或 partial，则该节点 partial
 * - 否则该节点不选中
 *
 * 按深度从深到浅计算（自底向上）。
 */
export function computeState(
  nodes: TagNode[],
  selectedIds: Set<string>,
): CascadingSelection {
  const childrenMap = buildChildrenMap(nodes)
  const parentMap = buildParentMap(nodes)
  const depths = computeDepths(nodes, parentMap)

  const selected = new Set(selectedIds)
  const partial = new Set<string>()

  const sorted = [...nodes].sort((a, b) => depths.get(b.id)! - depths.get(a.id)!)

  for (const node of sorted) {
    const children = childrenMap.get(node.id)
    if (!children || children.size === 0) continue

    const childIds = Array.from(children)
    const allSelected = childIds.every((id) => selected.has(id))
    const someSelected = childIds.some((id) => selected.has(id) || partial.has(id))

    if (allSelected) {
      selected.add(node.id)
      partial.delete(node.id)
    } else if (someSelected) {
      selected.delete(node.id)
      partial.add(node.id)
    } else {
      selected.delete(node.id)
      partial.delete(node.id)
    }
  }

  return { selected, partial }
}

function getDescendantIds(id: string, childrenMap: Map<string, Set<string>>): string[] {
  const result: string[] = []
  const queue = [id]
  const visited = new Set<string>([id])

  while (queue.length > 0) {
    const current = queue.shift()!
    const children = childrenMap.get(current)
    if (!children) continue
    for (const child of children) {
      if (visited.has(child)) continue
      visited.add(child)
      result.push(child)
      queue.push(child)
    }
  }

  return result
}

/**
 * 切换单个标签的选中状态，并级联处理其所有后代和祖先。
 *
 * - 若目标当前已选中（selected 或 partial）：取消目标及其所有后代
 * - 若目标当前未选中：选中目标及其所有后代
 * - 然后自底向上更新所有祖先的状态
 */
export function toggle(
  nodes: TagNode[],
  selectedIds: Set<string>,
  targetId: string,
): CascadingSelection {
  const childrenMap = buildChildrenMap(nodes)

  const nextSelected = new Set(selectedIds)
  const isCurrentlyChecked = nextSelected.has(targetId)

  if (isCurrentlyChecked) {
    nextSelected.delete(targetId)
    for (const desc of getDescendantIds(targetId, childrenMap)) {
      nextSelected.delete(desc)
    }
  } else {
    nextSelected.add(targetId)
    for (const desc of getDescendantIds(targetId, childrenMap)) {
      nextSelected.add(desc)
    }
  }

  return computeState(nodes, nextSelected)
}

/**
 * 全选指定的一组标签，并级联处理其所有后代和祖先。
 */
export function selectAll(
  nodes: TagNode[],
  selectedIds: Set<string>,
  ids: string[],
): CascadingSelection {
  const childrenMap = buildChildrenMap(nodes)
  const nextSelected = new Set(selectedIds)

  for (const id of ids) {
    nextSelected.add(id)
    for (const desc of getDescendantIds(id, childrenMap)) {
      nextSelected.add(desc)
    }
  }

  return computeState(nodes, nextSelected)
}

/**
 * 清空所有选中状态。
 */
export function clear(): CascadingSelection {
  return { selected: new Set<string>(), partial: new Set<string>() }
}
