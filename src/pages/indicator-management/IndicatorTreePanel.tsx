import { useMemo } from 'react'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'

interface IndicatorTreeNode extends TreeNode {
  indicator: IndicatorAttachment
  children?: IndicatorTreeNode[]
}

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

export default function IndicatorTreePanel() {
  const indicators = useAttachmentStore((state) => state.indicators)
  const tree = useMemo(() => buildIndicatorTree(indicators), [indicators])

  return (
    <div className="flex-1 overflow-y-auto px-2 pb-2" data-testid="indicator-tree-panel">
      <TreeView
        nodes={tree}
        renderNode={(node, { isSelected, isHovered }) => (
          <div className="flex flex-col justify-center">
            <span
              className={[
                'text-body leading-tight',
                isSelected ? 'font-medium text-dark-text-primary' : 'text-dark-text-primary',
                isHovered && !isSelected ? 'text-dark-text-primary' : '',
              ].join(' ')}
            >
              {node.indicator.name}
            </span>
            <span
              className={[
                'text-caption font-mono leading-tight',
                isSelected ? 'text-dark-text-secondary' : 'text-dark-text-tertiary',
              ].join(' ')}
            >
              {node.indicator.code}
            </span>
          </div>
        )}
        initialExpanded={tree.map((n) => n.id)}
      />
    </div>
  )
}
