import type { IndicatorAttachment, TagNode, Rule } from '@/models/indicatorAttachmentModel'

export interface IndicatorTreeNode {
  id: string
  indicator: IndicatorAttachment
  children?: IndicatorTreeNode[]
}

/**
 * 将 IndicatorAttachment 平表按 treeParentId 构建为嵌套指标树
 *
 * 找不到父节点的指标会被提升为根节点（防御性处理，避免数据丢失）。
 */
export function buildIndicatorTree(flat: IndicatorAttachment[]): IndicatorTreeNode[] {
  const nodeMap = new Map<string, IndicatorTreeNode>()
  const roots: IndicatorTreeNode[] = []

  for (const indicator of flat) {
    nodeMap.set(indicator.id, {
      id: indicator.id,
      indicator,
      children: undefined,
    })
  }

  for (const node of nodeMap.values()) {
    const parentId = node.indicator.treeParentId
    if (parentId && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!
      parent.children = parent.children ?? []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

/**
 * 深度优先遍历任意带 children 的树节点
 */
export function walkNodes<T extends { children?: T[] }>(nodes: T[], callback: (node: T) => void): void {
  for (const node of nodes) {
    callback(node)
    if (node.children) {
      walkNodes(node.children, callback)
    }
  }
}

/**
 * 深度优先遍历规则树
 */
export function walkRules(nodes: Rule[], callback: (node: Rule) => void): void {
  walkNodes(nodes, callback)
}
