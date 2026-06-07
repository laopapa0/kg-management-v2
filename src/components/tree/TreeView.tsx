import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { EASING, getTransition } from '@/components/motion/motion.tokens'

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
  renderIndentGuides?: 'always' | 'onHover' | 'none'
}

interface TreeItemProps<T extends TreeNode> {
  node: T
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  selectedId: string | null
  onSelect: (id: string) => void
  renderNode: (node: T, context: RenderNodeContext) => React.ReactNode
  renderIndentGuides: 'always' | 'onHover' | 'none'
}

const childrenContainerVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: getTransition('expand'),
      opacity: { duration: 0.15, ease: EASING.enter },
      staggerChildren: 0.03,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: getTransition('collapse'),
      opacity: { duration: 0.15, ease: EASING.exit },
    },
  },
}

const childItemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: EASING.enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: EASING.exit },
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
}: TreeItemProps<T>) {
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = expanded.has(node.id)
  const isSelected = selectedId === node.id
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const showGuides = renderIndentGuides === 'always' || (renderIndentGuides === 'onHover' && isHovered)

  const handleRowClick = useCallback(() => {
    onSelect(node.id)
  }, [onSelect, node.id])

  return (
    <div data-testid="tree-node" data-node-id={node.id}>
      <div
        data-testid="tree-node-row"
        data-node-id={node.id}
        data-selected={isSelected}
        data-hovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleRowClick}
        className={[
          'group relative flex h-9 cursor-pointer items-center gap-1 py-2 px-3',
          'transition-colors duration-150 ease-out',
          isSelected ? 'bg-[rgba(59,130,246,0.12)]' : isHovered ? 'bg-white/[0.04]' : '',
        ].join(' ')}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        <span
          data-testid="tree-node-accent-bar"
          className={[
            'absolute left-0 top-0 bottom-0 w-1 transition-opacity duration-150 ease-out',
            isSelected ? 'opacity-100' : isHovered ? 'opacity-50' : 'opacity-0',
          ].join(' ')}
          style={{ backgroundColor: '#3B82F6' }}
        />

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
                transitionDuration: '200ms',
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
        <div className="z-10 flex-1 min-w-0">
          {renderNode(node, { isSelected, isHovered, depth })}
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
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
}: TreeViewProps<T>) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(initialExpanded ?? []),
  )

  useEffect(() => {
    if (initialExpanded !== undefined) {
      setExpanded(new Set(initialExpanded))
    }
  }, [initialExpanded])

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    null,
  )
  const selectedId = controlledSelectedId ?? internalSelectedId

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

  return (
    <div data-testid="tree-view" data-initial="false" className="flex flex-col">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          onToggle={handleToggle}
          selectedId={selectedId}
          onSelect={handleSelect}
          renderNode={renderNode}
          renderIndentGuides={renderIndentGuides}
        />
      ))}
    </div>
  )
}
