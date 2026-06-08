import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TreePine } from 'lucide-react'
import { toast } from 'sonner'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import TreeNodeInlineEdit from '@/components/tree/TreeNodeInlineEdit'
import EmptyState from '@/components/empty-state/EmptyState'
import AddTreeNodeDialog from '@/components/dialog/AddTreeNodeDialog'
import DeleteTreeNodeWarningDialog from '@/components/dialog/DeleteTreeNodeWarningDialog'
import DeleteTreeNodeSpecialDialog from '@/components/dialog/DeleteTreeNodeSpecialDialog'
import AttachedBadge from '@/components/connection/AttachedBadge'
import BatchDetachMenu from '@/components/connection/BatchDetachMenu'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { buildIndicatorTree, type IndicatorTreeNode } from '@/utils/attachmentTree'

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
}

interface RenderTreeNode extends TreeNode {
  indicator: IndicatorAttachment
  children?: RenderTreeNode[]
}

const IndicatorTreePanel = forwardRef<IndicatorTreePanelRef>(function IndicatorTreePanel(_props, ref) {
  const indicators = useAttachmentStore((state) => state.indicators)
  const addIndicator = useAttachmentStore((state) => state.addIndicator)
  const renameIndicator = useAttachmentStore((state) => state.renameIndicator)
  const deleteIndicator = useAttachmentStore((state) => state.deleteIndicator)
  const deleteIndicatorTree = useAttachmentStore((state) => state.deleteIndicatorTree)
  const setIndicators = useAttachmentStore((state) => state.setIndicators)
  const undo = useAttachmentStore((state) => state.undo)
  const tree = useMemo(() => buildIndicatorTree(indicators), [indicators])
  // Expand all nodes that have children (L1 + L2) so the full tree is initially visible
  const initialExpandedIds = useMemo(() => {
    return indicators.filter((i) => indicators.some((c) => c.treeParentId === i.id)).map((i) => i.id)
  }, [indicators])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [specialDialogOpen, setSpecialDialogOpen] = useState(false)
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

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
  }))

  const handleAddConfirm = (name: string, parentId?: string) => {
    const newIndicator = addIndicator(name, parentId)
    if (newIndicator) {
      setHighlightedId(newIndicator.id)
      setTimeout(() => setHighlightedId((current) => (current === newIndicator.id ? null : current)), 500)
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
    deleteIndicator(deletingNodeId)

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

  if (tree.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-2 pb-2" data-testid="indicator-tree-panel">
        <EmptyState
          icon={<TreePine className="size-6" />}
          title="暂无指标树节点"
          description="当前部门下还没有构建指标树"
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 pb-2" data-testid="indicator-tree-panel">
        <TreeView
          nodes={tree as RenderTreeNode[]}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onEditNode={setEditingId}
          onDeleteNode={handleDeleteNode}
          onDragNode={handleDragNode}
          renderNode={(node, { isSelected, isHovered }) => {
            const isEditing = editingId === node.id
            const isHighlighted = highlightedId === node.id
            const attachedList = attachedIndicatorsByTreeNode.get(node.id) ?? []
            const attachedCount = attachedList.length

            return (
              <BatchDetachMenu
                onViewAttached={() => {}}
                detachOptions={
                  attachedCount > 0
                    ? [
                        {
                          label: '移除所有挂靠',
                          count: attachedCount,
                          onConfirm: () => {
                            setIndicators(
                              indicators.map((i) =>
                                i.treeParentId === node.id
                                  ? { ...i, treeParentId: undefined }
                                  : i,
                              ),
                            )
                          },
                        },
                      ]
                    : []
                }
              >
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
              </BatchDetachMenu>
            )
          }}
          initialExpanded={initialExpandedIds}
        />
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
