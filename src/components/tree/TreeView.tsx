import { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Pencil, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type ClientRect,
} from '@dnd-kit/core'
import { DURATION, EASING, getTransition } from '@/components/motion/motion.tokens'
import { getDropPosition, type DropPosition } from './treeDragUtils'

export interface TreeNode {
  id: string
  children?: TreeNode[]
}

export interface RenderNodeContext {
  isSelected: boolean
  isHovered: boolean
  depth: number
}

interface TreeViewProps<T extends TreeNode> {
  nodes: T[]
  renderNode: (node: T, context: RenderNodeContext) => React.ReactNode
  initialExpanded?: string[]
  onExpandedChange?: (expanded: Set<string>) => void
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  onEditNode?: (id: string) => void
  onDeleteNode?: (id: string) => void
  onDragNode?: (dragInfo: { draggedId: string; targetId: string; position: DropPosition }) => void
  renderIndentGuides?: 'always' | 'onHover' | 'none'
}

interface DragState {
  overId: string | null
  position: DropPosition | null
}

const DragStateContext = createContext<DragState>({ overId: null, position: null })

interface TreeItemProps<T extends TreeNode> {
  node: T
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
  renderNode: (node: T, context: RenderNodeContext) => React.ReactNode
  renderIndentGuides: 'always' | 'onHover' | 'none'
  onEditNode?: (id: string) => void
  onDeleteNode?: (id: string) => void
  onDragNode?: (dragInfo: { draggedId: string; targetId: string; position: DropPosition }) => void
}

const childrenContainerVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: getTransition('expand'),
      opacity: { duration: DURATION.fast, ease: EASING.enter },
      staggerChildren: 0.03,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: getTransition('collapse'),
      opacity: { duration: DURATION.fast, ease: EASING.exit },
      staggerChildren: 0.05,
    },
  },
}

const childItemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASING.enter },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: DURATION.fast, ease: EASING.exit },
  },
}

function TreeItem<T extends TreeNode>({
  node,
  depth,
  expanded,
  onToggle,
  selectedId,
  onSelect,
  renderNode,
  renderIndentGuides,
  onEditNode,
  onDeleteNode,
  onDragNode,
}: TreeItemProps<T>) {
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = expanded.has(node.id)
  const isSelected = selectedId === node.id
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const showGuides = renderIndentGuides === 'always' || (renderIndentGuides === 'onHover' && isHovered)
  const dragState = useContext(DragStateContext)
  const isDragOver = dragState.overId === node.id
  const dragPosition = dragState.position

  const handleRowClick = useCallback(() => {
    onSelect(node.id)
  }, [onSelect, node.id])

  const { attributes, listeners, setNodeRef: setDragRef, setActivatorNodeRef } = useDraggable({
    id: node.id,
    disabled: !onDragNode,
    data: { node },
  })

  const { setNodeRef: setDropRef } = useDroppable({
    id: node.id,
    disabled: !onDragNode,
    data: { node },
  })

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      setDragRef(el)
      setDropRef(el)
    },
    [setDragRef, setDropRef],
  )

  const isDropInside = isDragOver && dragPosition === 'inside'
  const isDropBefore = isDragOver && dragPosition === 'before'
  const isDropAfter = isDragOver && dragPosition === 'after'

  return (
    <div data-testid="tree-node" data-node-id={node.id}>
      {/* Drop before indicator */}
      {onDragNode && (
        <div
          data-testid="tree-drop-before-indicator"
          className={[
            'h-[2px] w-full transition-opacity duration-150',
            'bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)]',
            isDropBefore ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}

      <div
        ref={setRefs}
        data-testid="tree-node-row"
        data-node-id={node.id}
        data-selected={isSelected}
        data-hovered={isHovered}
        data-dnd-droppable={onDragNode ? 'true' : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleRowClick}
        className={[
          'group relative flex h-9 cursor-pointer items-center gap-1 py-2 px-3',
          'transition-colors duration-150 ease-out',
          isSelected ? 'bg-[rgba(59,130,246,0.12)]' : isHovered ? 'bg-white/[0.04]' : '',
          isDropInside ? 'bg-[#DBEAFE]' : '',
        ].join(' ')}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Left drop accent bar */}
        <span
          data-testid="tree-node-accent-bar"
          className={[
            'absolute left-0 top-0 bottom-0 transition-opacity duration-150 ease-out',
            isSelected ? 'w-1 opacity-100' : isHovered ? 'w-1 opacity-50' : 'w-1 opacity-0',
            isDropInside ? 'w-[3px] opacity-100' : '',
          ].join(' ')}
          style={{ backgroundColor: isDropInside ? '#3B82F6' : '#3B82F6' }}
        />

        {/* Drag handle */}
        {onDragNode && (
          <button
            ref={setActivatorNodeRef}
            type="button"
            data-testid="tree-node-drag-handle"
            aria-label={`拖拽节点 ${node.id}`}
            className={[
              'z-10 flex size-5 items-center justify-center rounded text-dark-text-tertiary',
              'transition-all duration-150 ease-out hover:text-dark-text-secondary',
              'cursor-grab active:cursor-grabbing',
              isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
            ].join(' ')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
        )}

        {renderIndentGuides !== 'none' && depth > 0 && (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex"
            style={{ width: `${depth * 20}px` }}
          >
            {Array.from({ length: depth }).map((_, i) => (
              <span
                key={i}
                data-testid="tree-indent-guide"
                className={[
                  'absolute top-0 bottom-0 w-px transition-opacity duration-150',
                  'bg-white/[0.06] group-hover:bg-white/[0.15]',
                  showGuides ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
                style={{ left: `${(i + 1) * 20 - 10}px` }}
              />
            ))}
          </span>
        )}

        {hasChildren ? (
          <button
            type="button"
            data-testid="tree-node-toggle"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `收起节点 ${node.id}` : `展开节点 ${node.id}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="z-10 flex size-5 items-center justify-center rounded text-dark-text-secondary transition-colors hover:bg-dark-tree-hover-bg hover:text-dark-accent-primary"
          >
            <ChevronRight
              className="size-4 transition-transform ease-out"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transitionDuration: `${DURATION.normal * 1000}ms`,
              }}
            />
          </button>
        ) : (
          <span
            data-testid="tree-node-leaf-placeholder"
            className="z-10 inline-block size-5"
            aria-hidden="true"
          />
        )}
        <div className={['z-10 flex-1 min-w-0', isSelected ? 'font-medium' : ''].join(' ')}>
          {renderNode(node, { isSelected, isHovered, depth })}
        </div>
        <div className="z-10 flex items-center gap-0.5">
          {onEditNode && (
            <button
              type="button"
              data-testid="tree-node-edit-button"
              aria-label={`编辑节点 ${node.id}`}
              onClick={(e) => {
                e.stopPropagation()
                onEditNode(node.id)
              }}
              className={[
                'flex size-6 items-center justify-center rounded text-dark-text-secondary',
                'transition-all duration-150 ease-out hover:bg-dark-tree-hover-bg hover:text-dark-accent-primary',
                isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
              ].join(' ')}
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          {onDeleteNode && (
            <button
              type="button"
              data-testid="tree-node-delete-button"
              aria-label={`删除节点 ${node.id}`}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteNode(node.id)
              }}
              className={[
                'flex size-6 items-center justify-center rounded text-dark-text-secondary',
                'transition-all duration-150 ease-out hover:bg-red-500/10 hover:text-red-400',
                isHovered ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
              ].join(' ')}
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            data-testid="tree-children-container"
            data-transition="expand"
            variants={childrenContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            {node.children!.map((child) => (
              <motion.div
                key={child.id}
                variants={childItemVariants}
                data-testid="tree-child-item"
                layout
              >
                <TreeItem
                  node={child as T}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  renderNode={renderNode}
                  renderIndentGuides={renderIndentGuides}
                  onEditNode={onEditNode}
                  onDeleteNode={onDeleteNode}
                  onDragNode={onDragNode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop after indicator */}
      {onDragNode && (
        <div
          data-testid="tree-drop-after-indicator"
          className={[
            'h-[2px] w-full transition-opacity duration-150',
            'bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)]',
            isDropAfter ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}
    </div>
  )
}

export default function TreeView<T extends TreeNode>({
  nodes,
  renderNode,
  initialExpanded,
  onExpandedChange,
  selectedId: controlledSelectedId,
  onSelect,
  renderIndentGuides = 'onHover',
  onEditNode,
  onDeleteNode,
  onDragNode,
}: TreeViewProps<T>) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(initialExpanded ?? []),
  )

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null,
  )
  const selectedId = controlledSelectedId ?? internalSelectedId

  const [dragState, setDragState] = useState<DragState>({ overId: null, position: null })
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
  )

  const handleToggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        onExpandedChange?.(next)
        return next
      })
    },
    [onExpandedChange],
  )

  const handleSelect = useCallback(
    (id: string) => {
      if (controlledSelectedId === undefined) {
        setInternalSelectedId((prev) => (prev === id ? null : id))
      }
      onSelect?.(id)
    },
    [controlledSelectedId, onSelect],
  )

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    setActiveDragId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      setDragState({ overId: null, position: null })
      return
    }

    const activeRect = active.rect.current.translated as ClientRect | null
    const overRect = over.rect

    if (activeRect && overRect) {
      const position = getDropPosition(activeRect, overRect)
      setDragState({ overId: over.id as string, position })
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const activeRect = active.rect.current.translated as ClientRect | null
        const overRect = over.rect
        const position = activeRect && overRect
          ? getDropPosition(activeRect, overRect)
          : 'inside'

        onDragNode?.({
          draggedId: active.id as string,
          targetId: over.id as string,
          position,
        })
      }
      setDragState({ overId: null, position: null })
      setActiveDragId(null)
    },
    [onDragNode],
  )

  const handleDragCancel = useCallback(() => {
    setDragState({ overId: null, position: null })
    setActiveDragId(null)
  }, [])

  const activeNode = activeDragId
    ? flattenNodes(nodes).find((n) => n.id === activeDragId)
    : null

  const treeContent = (
    <div data-testid="tree-view" data-initial="false" className="flex flex-col">
      <AnimatePresence>
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: DURATION.fast, ease: EASING.exit }}
            layout
          >
            <TreeItem
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={handleToggle}
              selectedId={selectedId}
              onSelect={handleSelect}
              renderNode={renderNode}
              renderIndentGuides={renderIndentGuides}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onDragNode={onDragNode}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  if (!onDragNode) {
    return treeContent
  }

  return (
    <DndContext
      data-dnd-context="true"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DragStateContext.Provider value={dragState}>
        {treeContent}
        <DragOverlay dropAnimation={null}>
          {activeNode ? (
            <div
              className="flex h-9 items-center gap-2 rounded-md bg-dark-card-l1 px-3 py-2 shadow-lg"
              style={{ scale: '0.98', opacity: 0.9 }}
            >
              <GripVertical className="size-3.5 text-dark-text-tertiary" />
              <span className="text-sm text-dark-text-primary">
                {(activeNode as T).id}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DragStateContext.Provider>
    </DndContext>
  )
}

function flattenNodes<T extends TreeNode>(nodes: T[]): T[] {
  const result: T[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children) {
      result.push(...flattenNodes(node.children as T[]))
    }
  }
  return result
}
