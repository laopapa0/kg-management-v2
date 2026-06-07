import { useMemo, useState, useCallback } from 'react'
import { Tags } from 'lucide-react'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import EmptyState from '@/components/empty-state/EmptyState'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { TagNode } from '@/models/indicatorAttachmentModel'
import { buildTagTree } from '@/models/indicatorAttachmentModel'
import { walkNodes } from '@/utils/attachmentTree'
import TagCloud from '@/components/tag/TagCloud'
import TagPill from '@/components/tag/TagPill'
import { toggle, computeState } from '@/components/tree/CascadingStateEngine'

interface TagTreeNode extends TreeNode {
  name: string
  color?: string
}

interface TagGroupProps {
  node: TagNode
  selectedTagIds: Set<string>
  partialTagIds: Set<string>
  onToggle: (id: string) => void
}

function TagGroup({ node, selectedTagIds, partialTagIds, onToggle }: TagGroupProps) {
  const hasChildren = node.children && node.children.length > 0
  const childTags = hasChildren ? node.children! : [node]

  return (
    <div data-testid={`tag-group-${node.id}`} className="mb-2">
      {hasChildren && (
        <div className="mb-1.5">
          <TagPill
            tag={node}
            selected={selectedTagIds.has(node.id)}
            partial={partialTagIds.has(node.id)}
            onClick={() => onToggle(node.id)}
          />
        </div>
      )}
      <TagCloud
        tags={childTags}
        selectedTagIds={selectedTagIds}
        partialTagIds={partialTagIds}
        onToggle={onToggle}
      />
    </div>
  )
}

export default function TagSetPanel() {
  const tagNodes = useAttachmentStore((state) => state.tagNodes)
  const indicators = useAttachmentStore((state) => state.indicators)

  const tree = useMemo(() => buildTagTree(tagNodes), [tagNodes])

  const initialSelectedIds = useMemo(() => {
    const set = new Set<string>()
    for (const indicator of indicators) {
      for (const tagId of indicator.tagIds) {
        set.add(tagId)
      }
    }
    return set
  }, [indicators])

  const [selection, setSelection] = useState(() => computeState(tagNodes, initialSelectedIds))

  const handleToggle = useCallback(
    (id: string) => {
      setSelection((prev) => toggle(tagNodes, prev.selected, id))
    },
    [tagNodes],
  )

  const nodeMap = useMemo(() => {
    const map = new Map<string, TagNode>()
    walkNodes(tree, (node) => {
      map.set(node.id, node)
    })
    return map
  }, [tree])

  const rootNodes: TagTreeNode[] = useMemo(
    () =>
      tree.map((node) => ({
        id: node.id,
        name: node.name,
        color: node.color,
      })),
    [tree],
  )

  if (tree.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-3 pb-2" data-testid="tag-set-panel">
        <EmptyState
          icon={<Tags className="size-6" />}
          title="暂无标签"
          description="当前部门下还没有配置标签集"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-2" data-testid="tag-set-panel">
      <TreeView
        nodes={rootNodes}
        renderNode={(node) => {
          const fullNode = nodeMap.get(node.id)
          if (!fullNode) return null
          return (
            <TagGroup
              node={fullNode}
              selectedTagIds={selection.selected}
              partialTagIds={selection.partial}
              onToggle={handleToggle}
            />
          )
        }}
      />
    </div>
  )
}
