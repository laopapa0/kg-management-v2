import { useMemo } from 'react'
import { Tags } from 'lucide-react'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import EmptyState from '@/components/empty-state/EmptyState'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { TagNode } from '@/models/indicatorAttachmentModel'
import { buildTagTree } from '@/models/indicatorAttachmentModel'
import { walkNodes } from '@/utils/attachmentTree'

interface TagTreeNode extends TreeNode {
  name: string
  color?: string
}

function collectTagIds(nodes: TagNode[]): Set<string> {
  const set = new Set<string>()
  for (const node of nodes) {
    set.add(node.id)
    if (node.children) {
      for (const id of collectTagIds(node.children)) {
        set.add(id)
      }
    }
  }
  return set
}

interface TagPillProps {
  tag: TagNode
  selected: boolean
}

function TagPill({ tag, selected }: TagPillProps) {
  const baseColor = tag.color ?? '#64748B'
  return (
    <span
      data-testid={`tag-pill-${tag.id}`}
      data-selected={selected ? 'true' : 'false'}
      data-tag-id={tag.id}
      className={[
        'inline-flex h-7 items-center whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors duration-150',
        'border',
        selected
          ? 'bg-[#111B26] text-[#4DA6FF] border-[#15417E]'
          : 'bg-dark-card-l2 text-dark-text-primary hover:bg-dark-tree-hover-bg',
      ].join(' ')}
      style={{
        borderColor: selected ? '#15417E' : baseColor,
        boxShadow: selected ? '0 0 8px rgba(77, 166, 255, 0.25)' : undefined,
      }}
    >
      {tag.name}
    </span>
  )
}

interface TagGroupProps {
  node: TagNode
  selectedTagIds: Set<string>
}

function TagGroup({ node, selectedTagIds }: TagGroupProps) {
  if (!node.children || node.children.length === 0) {
    return <TagPill tag={node} selected={selectedTagIds.has(node.id)} />
  }

  return (
    <div data-testid={`tag-group-${node.id}`} className="mb-2">
      <div className="mb-1.5 text-xs font-semibold tracking-wide text-dark-text-secondary">
        {node.name}
      </div>
      <div data-testid="tag-list-row" className="flex flex-wrap gap-2">
        {node.children.map((child) => (
          <TagGroup key={child.id} node={child} selectedTagIds={selectedTagIds} />
        ))}
      </div>
    </div>
  )
}

export default function TagSetPanel() {
  const tagNodes = useAttachmentStore((state) => state.tagNodes)
  const indicators = useAttachmentStore((state) => state.indicators)

  const tree = useMemo(() => buildTagTree(tagNodes), [tagNodes])

  const selectedTagIds = useMemo(() => {
    const set = new Set<string>()
    for (const indicator of indicators) {
      for (const tagId of indicator.tagIds) {
        set.add(tagId)
      }
    }
    return set
  }, [indicators])

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
          return <TagGroup node={fullNode} selectedTagIds={selectedTagIds} />
        }}
      />
    </div>
  )
}
