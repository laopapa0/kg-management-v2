import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react'
import type { MindElixirInstance, Operation } from 'mind-elixir'
import { motion } from 'framer-motion'
import { TreePine } from 'lucide-react'
import { toast } from 'sonner'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import TreeNodeInlineEdit from '@/components/tree/TreeNodeInlineEdit'
import EmptyState from '@/components/empty-state/EmptyState'
import PanelHeader from '@/components/panel/PanelHeader'
import AddTreeNodeDialog from '@/components/dialog/AddTreeNodeDialog'
import DeleteTreeNodeWarningDialog from '@/components/dialog/DeleteTreeNodeWarningDialog'
import DeleteTreeNodeSpecialDialog from '@/components/dialog/DeleteTreeNodeSpecialDialog'
import AttachedBadge from '@/components/connection/AttachedBadge'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { buildIndicatorTree, type IndicatorTreeNode } from '@/utils/attachmentTree'
import { indicatorsToMindElixirData, handleOperation, findParentId } from '@/utils/mindMapAdapter'
import MindMapWrapper from '@/components/mindmap/MindMapWrapper'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** 递归检查某个节点下是否有已挂靠（有 tagIds/ruleIds）的真实指标 */
function hasAttachedDescendantIndicators(indicators: IndicatorAttachment[], parentId: string): boolean {
  const children = indicators.filter((i) => i.treeParentId === parentId)
  return children.some((child) => {
    if (child.indicatorType !== '虚拟分组' && (child.tagIds.length > 0 || child.ruleIds.length > 0)) {
      return true
    }
    return hasAttachedDescendantIndicators(indicators, child.id)
  })
}

/** 递归获取某个节点下的所有后代真实指标（排除虚拟分组节点） */
function getDescendantRealIndicators(indicators: IndicatorAttachment[], parentId: string): IndicatorAttachment[] {
  const result: IndicatorAttachment[] = []
  const children = indicators.filter((i) => i.treeParentId === parentId)
  for (const child of children) {
    if (child.indicatorType !== '虚拟分组') {
      result.push(child)
    }
    result.push(...getDescendantRealIndicators(indicators, child.id))
  }
  return result
}
import { applyDragOperation } from '@/components/tree/treeDragHelpers'
import type { DropPosition } from '@/components/tree/treeDragUtils'

export interface IndicatorTreePanelRef {
  openAddDialog: () => void
  expandAndSelectNode: (indicatorId: string) => void
}

interface IndicatorTreePanelProps {
  onViewModeChange?: (mode: 'tree' | 'mindmap') => void
  isConnectionMode?: boolean
}

interface RenderTreeNode extends TreeNode {
  indicator: IndicatorAttachment
  children?: RenderTreeNode[]
}

const IndicatorTreePanel = forwardRef<IndicatorTreePanelRef, IndicatorTreePanelProps>(
  function IndicatorTreePanel({ onViewModeChange, isConnectionMode = false }, ref) {
  const indicators = useAttachmentStore((state) => state.indicators)
  const addIndicator = useAttachmentStore((state) => state.addIndicator)
  const renameIndicator = useAttachmentStore((state) => state.renameIndicator)
  const deleteIndicator = useAttachmentStore((state) => state.deleteIndicator)
  const deleteIndicatorTree = useAttachmentStore((state) => state.deleteIndicatorTree)
  const setIndicators = useAttachmentStore((state) => state.setIndicators)
  const undo = useAttachmentStore((state) => state.undo)
  const tree = useMemo(() => buildIndicatorTree(indicators), [indicators])
  // 初始展开所有虚拟分组节点（L1+L2+"默认"），叶子节点默认折叠
  const initialExpandedIds = useMemo(() => {
    return indicators
      .filter((i) => i.indicatorType === '虚拟分组')
      .map((i) => i.id)
  }, [indicators])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [specialDialogOpen, setSpecialDialogOpen] = useState(false)
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initialExpandedIds))
  const [viewMode, setViewMode] = useState<'tree' | 'mindmap'>('tree')
  const [hasEverBeenMindMap, setHasEverBeenMindMap] = useState(false)
  const mindMapInstanceRef = useRef<MindElixirInstance | null>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentDepartmentName = useAttachmentStore(
    (state) => state.departments.find((d) => d.id === state.currentDepartmentId)?.name ?? '默认分组',
  )

  const handleViewModeChange = (mode: 'tree' | 'mindmap') => {
    setViewMode(mode)
    if (mode === 'mindmap') {
      setHasEverBeenMindMap(true)
    }
    onViewModeChange?.(mode)
  }

  const handleMindMapInit = (instance: MindElixirInstance) => {
    mindMapInstanceRef.current = instance
  }

  const handleMindMapOperation = useCallback(
    (op: Operation) => {
      handleOperation(op as { name: string; obj?: { id: string; topic?: string; [key: string]: unknown }; origin?: { id?: string; [key: string]: unknown } }, {
        rename: (id, name) => renameIndicator(id, name),
        add: (name, parentId) => { const created = addIndicator(name, parentId); return created?.id ?? 'new-id'; },
        remove: (id) => deleteIndicator(id),
        setParent: (id, newParentId) => {
          setIndicators(
            indicators.map((i) => (i.id === id ? { ...i, treeParentId: newParentId } : i)),
          )
        },
        resolveParent: (id) => {
          const mindInstance = mindMapInstanceRef.current
          if (!mindInstance) return undefined
          const mindData = mindInstance.getData()
          const rootNode = mindData.nodeData as { id: string; children?: Record<string, unknown>[] }
          return findParentId(rootNode, id)
        },
      })
    },
    [indicators, renameIndicator, addIndicator, deleteIndicator, setIndicators],
  )

  useEffect(() => {
    if (viewMode === 'mindmap' && mindMapInstanceRef.current) {
      const nodeData = indicatorsToMindElixirData(indicators, currentDepartmentName)
      mindMapInstanceRef.current.refresh({ nodeData })
    }
  }, [viewMode, indicators, currentDepartmentName])

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  const existingNames = useMemo(() => indicators.map((i) => i.name), [indicators])

  const attachedIndicatorsByTreeNode = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>()
    for (const indicator of indicators) {
      if (indicator.treeParentId) {
        const list = map.get(indicator.treeParentId) ?? []
        list.push({ id: indicator.id, name: indicator.name })
        map.set(indicator.treeParentId, list)
      }
    }
    return map
  }, [indicators])

  useImperativeHandle(ref, () => ({
    openAddDialog: () => setDialogOpen(true),
    expandAndSelectNode: (indicatorId: string) => {
      // Walk up the treeParentId chain to find all ancestors
      const idsToExpand = new Set<string>()
      let currentId: string | undefined = indicatorId
      while (currentId) {
        const indicator = indicators.find((i) => i.id === currentId)
        if (!indicator) break
        if (indicator.treeParentId) {
          idsToExpand.add(indicator.treeParentId)
        }
        currentId = indicator.treeParentId
      }
      setExpanded((prev) => {
        const next = new Set(prev)
        for (const id of idsToExpand) next.add(id)
        return next
      })
      setSelectedId(indicatorId)
      setHighlightedId(indicatorId)
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = setTimeout(() => setHighlightedId((current) => (current === indicatorId ? null : current)), 500)
    },
  }))

  const handleAddConfirm = (name: string, parentId?: string) => {
    const newIndicator = addIndicator(name, parentId)
    if (newIndicator) {
      if (parentId) {
        setExpanded((prev) => new Set([...prev, parentId]))
      }
      setHighlightedId(newIndicator.id)
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = setTimeout(() => setHighlightedId((current) => (current === newIndicator.id ? null : current)), 500)
      setSelectedId(newIndicator.id)
    }
  }

  const handleEditSave = (id: string, name: string) => {
    renameIndicator(id, name)
    setEditingId(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  const handleDeleteNode = (id: string) => {
    const indicator = indicators.find((i) => i.id === id)
    if (!indicator) return

    const children = indicators.filter((i) => i.treeParentId === id)
    const hasAttachedIndicators = hasAttachedDescendantIndicators(indicators, id)

    if (hasAttachedIndicators) {
      setDeletingNodeId(id)
      setSpecialDialogOpen(true)
      return
    }

    if (children.length > 0) {
      setDeletingNodeId(id)
      setWarningDialogOpen(true)
      return
    }

    performDelete(id)
  }

  const performDelete = (id: string) => {
    const indicator = indicators.find((i) => i.id === id)
    if (!indicator) return

    deleteIndicator(id)

    toast('节点已删除', {
      description: `「${indicator.name}」已被删除`,
      duration: 5000,
      action: {
        label: '撤销',
        onClick: () => undo(),
      },
    })
  }

  const handleWarningConfirm = () => {
    if (!deletingNodeId) return
    const indicator = indicators.find((i) => i.id === deletingNodeId)
    if (!indicator) return

    deleteIndicatorTree(deletingNodeId)

    toast('节点已删除', {
      description: `「${indicator.name}」及其子节点已被删除`,
      duration: 5000,
      action: {
        label: '撤销',
        onClick: () => undo(),
      },
    })
    setDeletingNodeId(null)
  }

  const handleSpecialConfirm = () => {
    if (!deletingNodeId) return
    const indicator = indicators.find((i) => i.id === deletingNodeId)
    if (!indicator) return

    const realIndicators = getDescendantRealIndicators(indicators, deletingNodeId)

    // Collect all descendant virtual grouping nodes to cascade delete
    const idsToDelete = new Set<string>([deletingNodeId])
    let changed = true
    while (changed) {
      changed = false
      for (const i of indicators) {
        if (
          !idsToDelete.has(i.id) &&
          i.indicatorType === '虚拟分组' &&
          i.treeParentId &&
          idsToDelete.has(i.treeParentId)
        ) {
          idsToDelete.add(i.id)
          changed = true
        }
      }
    }

    // Remove all virtual grouping nodes in the cascade and clear treeParentId
    // for real indicators whose parent (virtual group) is being deleted
    const next = indicators
      .filter((i) => !idsToDelete.has(i.id))
      .map((i) => {
        if (i.treeParentId && idsToDelete.has(i.treeParentId)) {
          return { ...i, treeParentId: undefined }
        }
        return i
      })

    setIndicators(next)

    toast('节点已删除', {
      description: `「${indicator.name}」已删除，${realIndicators.length} 个指标回到「待挂靠」区域`,
      duration: 5000,
      action: {
        label: '撤销',
        onClick: () => undo(),
      },
    })
    setDeletingNodeId(null)
  }

  const handleDragNode = ({
    draggedId,
    targetId,
    position,
  }: {
    draggedId: string
    targetId: string
    position: DropPosition
  }) => {
    const next = applyDragOperation(indicators, draggedId, targetId, position)
    if (next !== indicators) {
      setIndicators(next)
    }
  }

  const toggleTabs = (
    <Tabs value={viewMode} onValueChange={(v) => handleViewModeChange(v as 'tree' | 'mindmap')}>
      <TabsList className="h-7 bg-dark-elevated border border-dark-border" data-testid="tree-view-toggle">
        <TabsTrigger
          value="tree"
          data-testid="tree-view-toggle-tree"
          className="text-xs data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
        >
          列表
        </TabsTrigger>
        <TabsTrigger
          value="mindmap"
          data-testid="tree-view-toggle-mindmap"
          className="text-xs data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
        >
          脑图
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden" data-testid="indicator-tree-panel">
        <PanelHeader title="指标树" onAdd={() => setDialogOpen(true)} extra={toggleTabs} />
        <div className={viewMode === 'mindmap' ? 'flex-1 overflow-hidden min-h-0' : 'flex-1 overflow-y-auto px-2 pb-2 min-h-0'}>
          {tree.length === 0 ? (
            <EmptyState
              icon={<TreePine className="size-6" />}
              title="暂无指标树节点"
              description="当前部门下还没有构建指标树"
            />
          ) : (
            <>
              <div className={viewMode === 'tree' ? 'flex h-full flex-col' : 'hidden'} data-testid="tree-view-wrapper">
                <TreeView
                  nodes={tree as RenderTreeNode[]}
                  expanded={expanded}
                  onExpandedChange={setExpanded}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onEditNode={setEditingId}
                  canEditNode={(node) => node.indicator.indicatorType === '虚拟分组'}
                  onDeleteNode={handleDeleteNode}
                  onDragNode={handleDragNode}
                  renderNode={(node, { isSelected, isHovered }) => {
                    const isEditing = editingId === node.id
                    const isHighlighted = highlightedId === node.id
                    const attachedList = attachedIndicatorsByTreeNode.get(node.id) ?? []
                    const attachedCount = attachedList.length

                    return (
                        <motion.div
                          data-testid={`indicator-tree-node-content-${node.id}`}
                          className="flex flex-col justify-center"
                          animate={isHighlighted ? { backgroundColor: ['rgba(219, 234, 254, 0)', 'rgba(219, 234, 254, 1)', 'rgba(219, 234, 254, 0)'] } : {}}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                          {isEditing ? (
                            <TreeNodeInlineEdit
                              initialName={node.indicator.name}
                              existingNames={existingNames}
                              onSave={(name) => handleEditSave(node.id, name)}
                              onCancel={handleEditCancel}
                            />
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-col justify-center min-w-0">
                                <span
                                  className={[
                                    'text-body leading-tight truncate',
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
                              {isHovered && attachedCount > 0 ? (
                                <AttachedBadge
                                  count={attachedCount}
                                  indicators={attachedList}
                                  onDeleteOne={(indicatorId) => {
                                    setIndicators(
                                      indicators.map((i) =>
                                        i.id === indicatorId ? { ...i, treeParentId: undefined } : i,
                                      ),
                                    )
                                  }}
                                  onDeleteAll={() => {
                                    setIndicators(
                                      indicators.map((i) =>
                                        i.treeParentId === node.id ? { ...i, treeParentId: undefined } : i,
                                      ),
                                    )
                                  }}
                                />
                              ) : null}
                            </div>
                          )}
                        </motion.div>
                    )
                  }}
                  initialExpanded={initialExpandedIds}
                />
              </div>
              {hasEverBeenMindMap && (
                <div className={viewMode === 'mindmap' ? 'flex h-full' : 'hidden'} data-testid="mind-map-container">
                  <MindMapWrapper
                    data={indicators}
                    defaultGroupName={currentDepartmentName}
                    onInit={handleMindMapInit}
                    onOperation={handleMindMapOperation}
                    isConnectionMode={isConnectionMode}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddTreeNodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedNodeId={selectedId}
        onConfirm={handleAddConfirm}
      />
      <DeleteTreeNodeWarningDialog
        open={warningDialogOpen}
        onOpenChange={setWarningDialogOpen}
        nodeName={indicators.find((i) => i.id === deletingNodeId)?.name ?? ''}
        childCount={indicators.filter((i) => i.treeParentId === deletingNodeId).length}
        onConfirm={handleWarningConfirm}
      />
      <DeleteTreeNodeSpecialDialog
        open={specialDialogOpen}
        onOpenChange={setSpecialDialogOpen}
        nodeName={indicators.find((i) => i.id === deletingNodeId)?.name ?? ''}
        attachedCount={
          deletingNodeId
            ? getDescendantRealIndicators(indicators, deletingNodeId).filter(
                (i) => i.tagIds.length > 0 || i.ruleIds.length > 0,
              ).length
            : 0
        }
        onConfirm={handleSpecialConfirm}
      />
    </>
  )
})

export default IndicatorTreePanel
