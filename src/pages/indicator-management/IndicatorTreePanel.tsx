import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TreePine } from 'lucide-react'
import { toast } from 'sonner'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import TreeNodeInlineEdit from '@/components/tree/TreeNodeInlineEdit'
import EmptyState from '@/components/empty-state/EmptyState'
import AddTreeNodeDialog from '@/components/dialog/AddTreeNodeDialog'
import DeleteTreeNodeWarningDialog from '@/components/dialog/DeleteTreeNodeWarningDialog'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { buildIndicatorTree, type IndicatorTreeNode } from '@/utils/attachmentTree'

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
  const undo = useAttachmentStore((state) => state.undo)
  const tree = useMemo(() => buildIndicatorTree(indicators), [indicators])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const existingNames = useMemo(() => indicators.map((i) => i.name), [indicators])

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

    const hasChildren = indicators.some((i) => i.treeParentId === id)
    if (hasChildren) {
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
          renderNode={(node, { isSelected, isHovered }) => {
            const isEditing = editingId === node.id
            const isHighlighted = highlightedId === node.id

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
                  <>
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
                  </>
                )}
              </motion.div>
            )
          }}
          initialExpanded={tree.map((n) => n.id)}
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
    </>
  )
})

export default IndicatorTreePanel
