import { useMemo, useState, useCallback, useEffect } from 'react'
import { Tags } from 'lucide-react'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import EmptyState from '@/components/empty-state/EmptyState'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { TagNode } from '@/models/indicatorAttachmentModel'
import { buildTagTree } from '@/models/indicatorAttachmentModel'
import { walkNodes } from '@/utils/attachmentTree'
import TagCloud from '@/components/tag/TagCloud'
import TagPill from '@/components/tag/TagPill'
import AttachedBadge from '@/components/connection/AttachedBadge'
import BatchDetachMenu from '@/components/connection/BatchDetachMenu'
import TreeSearchInput from '@/components/search/TreeSearchInput'
import { toggle, computeState, clear } from '@/components/tree/CascadingStateEngine'

interface TagTreeNode extends TreeNode {
  name: string
  color?: string
}

interface SearchResult {
  matchedIds: Set<string>
  ancestorIds: Set<string>
  matchCounts: Map<string, number>
}

function computeSearchResult(tree: TagNode[], term: string): SearchResult {
  if (!term) {
    return {
      matchedIds: new Set<string>(),
      ancestorIds: new Set<string>(),
      matchCounts: new Map<string, number>(),
    }
  }
  const lower = term.toLowerCase()
  const matchedIds = new Set<string>()
  const matchCounts = new Map<string, number>()

  function dfs(node: TagNode): number {
    let count = 0
    if (node.name.toLowerCase().includes(lower)) {
      matchedIds.add(node.id)
      count++
    }
    for (const child of node.children ?? []) {
      count += dfs(child)
    }
    if (count > 0) {
      matchCounts.set(node.id, count)
    }
    return count
  }

  for (const root of tree) dfs(root)

  const ancestorIds = new Set<string>()
  function markAncestors(node: TagNode) {
    for (const child of node.children ?? []) {
      if (matchedIds.has(child.id) || ancestorIds.has(child.id)) {
        ancestorIds.add(node.id)
      }
      markAncestors(child)
    }
  }
  for (const root of tree) markAncestors(root)

  return { matchedIds, ancestorIds, matchCounts }
}

export default function TagSetPanel() {
  const tagNodes = useAttachmentStore((state) => state.tagNodes)
  const indicators = useAttachmentStore((state) => state.indicators)
  const setTagNodes = useAttachmentStore((state) => state.setTagNodes)
  const setIndicators = useAttachmentStore((state) => state.setIndicators)

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
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 150)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const [userExpanded, setUserExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of tree) {
      if (node.children && node.children.length > 0) initial.add(node.id)
    }
    return initial
  })

  const { matchedIds, ancestorIds, matchCounts, dimmedTagIds } = useMemo(() => {
    const result = computeSearchResult(tree, debouncedTerm)
    const dimmed = new Set<string>()
    if (debouncedTerm) {
      walkNodes(tree, (node) => {
        if (!result.matchedIds.has(node.id) && !result.ancestorIds.has(node.id)) {
          dimmed.add(node.id)
        }
      })
    }
    return { ...result, dimmedTagIds: dimmed }
  }, [debouncedTerm, tree])

  const expanded = useMemo(() => {
    const next = new Set(userExpanded)
    if (debouncedTerm) {
      for (const id of ancestorIds) next.add(id)
    }
    return next
  }, [userExpanded, ancestorIds, debouncedTerm])

  const handleToggle = useCallback(
    (id: string) => {
      setSelection((prev) => toggle(tagNodes, prev.selected, id))
    },
    [tagNodes],
  )

  const handleClear = useCallback(() => {
    setSelection(clear())
  }, [])

  const handleColorChange = useCallback(
    (tagId: string, color: string) => {
      setTagNodes(
        tagNodes.map((node) => (node.id === tagId ? { ...node, color } : node)),
      )
    },
    [tagNodes, setTagNodes],
  )

  const attachedIndicatorsByTag = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>()
    for (const indicator of indicators) {
      for (const tagId of indicator.tagIds) {
        const list = map.get(tagId) ?? []
        list.push({ id: indicator.id, name: indicator.name })
        map.set(tagId, list)
      }
    }
    return map
  }, [indicators])

  const handleDetachAllFromTag = useCallback(
    (tagId: string) => {
      setIndicators(
        indicators.map((i) =>
          i.tagIds.includes(tagId) ? { ...i, tagIds: i.tagIds.filter((id) => id !== tagId) } : i,
        ),
      )
    },
    [indicators, setIndicators],
  )

  const handleDetachOneFromTag = useCallback(
    (tagId: string, indicatorId: string) => {
      setIndicators(
        indicators.map((i) =>
          i.id === indicatorId ? { ...i, tagIds: i.tagIds.filter((id) => id !== tagId) } : i,
        ),
      )
    },
    [indicators, setIndicators],
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
        children:
          node.children && node.children.length > 0
            ? node.children.map((child) => ({ id: child.id }))
            : undefined,
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
      <div className="sticky top-0 z-10 space-y-2 bg-dark-card-l1 pb-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-text-secondary">
            已选{' '}
            <span
              data-testid="tag-selected-count"
              className="font-semibold text-dark-text-primary"
            >
              {selection.selected.size}
            </span>{' '}
            个
          </span>
          <button
            type="button"
            data-testid="tag-clear-button"
            onClick={handleClear}
            className="text-xs text-dark-text-secondary transition-colors hover:text-dark-accent-primary"
          >
            清空
          </button>
        </div>
        <TreeSearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>
      <TreeView
        nodes={rootNodes}
        expanded={expanded}
        onExpandedChange={setUserExpanded}
        renderNode={(node, { isHovered }) => {
          const fullNode = nodeMap.get(node.id)
          if (!fullNode) return null
          const matchCount = matchCounts.get(fullNode.id)
          const isDimmed = debouncedTerm
            ? !matchedIds.has(fullNode.id) && !ancestorIds.has(fullNode.id)
            : false

          const childTagIds = new Set(fullNode.children?.map((c) => c.id) ?? [])
          const attachedIds = new Set<string>()
          for (const indicator of indicators) {
            for (const tagId of indicator.tagIds) {
              if (childTagIds.has(tagId)) {
                attachedIds.add(indicator.id)
                break
              }
            }
          }
          const attachedCount = attachedIds.size
          const attachedList = Array.from(attachedIds)
            .map((id) => indicators.find((i) => i.id === id))
            .filter(Boolean)
            .map((i) => ({ id: i!.id, name: i!.name }))

          return (
            <BatchDetachMenu
              detachOptions={
                attachedCount > 0
                  ? [
                      {
                        label: '移除所有标签集挂靠',
                        count: attachedCount,
                        onConfirm: () => {
                          const ids = Array.from(attachedIds)
                          setIndicators(
                            indicators.map((i) =>
                              ids.includes(i.id)
                                ? { ...i, tagIds: i.tagIds.filter((tid) => !childTagIds.has(tid)) }
                                : i,
                            ),
                          )
                        },
                      },
                    ]
                  : []
              }
            >
              <div className="flex items-center gap-2">
                <TagPill
                  tag={fullNode}
                  selected={selection.selected.has(fullNode.id)}
                  partial={selection.partial.has(fullNode.id)}
                  onClick={() => handleToggle(fullNode.id)}
                  searchTerm={debouncedTerm}
                  dimmed={isDimmed}
                  editable
                  onColorChange={(color) => handleColorChange(fullNode.id, color)}
                />
                {debouncedTerm && matchCount ? (
                  <span
                    data-testid={`tag-match-count-${fullNode.id}`}
                    className="inline-flex items-center rounded-full border border-[#15417E] bg-[#111B26] px-2 py-0.5 text-xs font-medium text-[#4DA6FF]"
                  >
                    {matchCount}
                  </span>
                ) : null}
                {isHovered && attachedCount > 0 ? (
                  <AttachedBadge
                    count={attachedCount}
                    indicators={attachedList}
                    onDeleteOne={(indicatorId) => {
                      const tagId = indicators.find((i) => i.id === indicatorId)?.tagIds.find((tid) => childTagIds.has(tid))
                      if (tagId) handleDetachOneFromTag(tagId, indicatorId)
                    }}
                    onDeleteAll={() => {
                      const ids = Array.from(attachedIds)
                      setIndicators(
                        indicators.map((i) =>
                          ids.includes(i.id)
                            ? { ...i, tagIds: i.tagIds.filter((tid) => !childTagIds.has(tid)) }
                            : i,
                        ),
                      )
                    }}
                  />
                ) : null}
              </div>
            </BatchDetachMenu>
          )
        }}
        renderChildren={(node) => {
          const fullNode = nodeMap.get(node.id)
          if (!fullNode) return null
          const childTags = fullNode.children?.length ? fullNode.children : []
          return (
            <div data-testid={`tag-group-${node.id}`} className="pb-2 pl-6">
              <TagCloud
                tags={childTags}
                selectedTagIds={selection.selected}
                partialTagIds={selection.partial}
                onToggle={handleToggle}
                dimmedTagIds={dimmedTagIds}
                searchTerm={debouncedTerm}
                editable
                onColorChange={handleColorChange}
              />
            </div>
          )
        }}
      />
    </div>
  )
}
