import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { EASING, getTransition } from '@/components/motion/motion.tokens'

export interface TreeNode {
  id: string
  children?: TreeNode[]
}

interface TreeViewProps<T extends TreeNode> {
  nodes: T[]
  renderNode: (node: T) => React.ReactNode
  initialExpanded?: string[]
  onExpandedChange?: (expanded: Set<string>) => void
}

interface TreeItemProps<T extends TreeNode> {
  node: T
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  renderNode: (node: T) => React.ReactNode
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
  renderNode,
}: TreeItemProps<T>) {
  const isExpanded = expanded.has(node.id)
  const hasChildren = Boolean(node.children && node.children.length > 0)

  return (
    <div data-testid="tree-node" data-node-id={node.id}>
      <div
        data-testid="tree-node-content"
        data-node-id={node.id}
        className="flex items-center gap-1 py-1"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            data-testid="tree-node-toggle"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `收起节点 ${node.id}` : `展开节点 ${node.id}`}
            onClick={() => onToggle(node.id)}
            className="flex size-5 items-center justify-center rounded text-dark-text-secondary transition-colors hover:bg-dark-tree-hover-bg hover:text-dark-accent-primary"
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
            className="inline-block size-5"
            aria-hidden="true"
          />
        )}
        <div className="flex-1 min-w-0">{renderNode(node)}</div>
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
                  renderNode={renderNode}
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
}: TreeViewProps<T>) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(initialExpanded ?? []),
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

  return (
    <div data-testid="tree-view" data-initial="false" className="flex flex-col">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          onToggle={handleToggle}
          renderNode={renderNode}
        />
      ))}
    </div>
  )
}
