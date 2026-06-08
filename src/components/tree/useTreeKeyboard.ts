import { useCallback } from 'react'
import type { TreeNode } from './TreeView'

interface UseTreeKeyboardOptions<T extends TreeNode> {
  nodes: T[]
  expanded: Set<string>
  selectedId: string | null
  onSelect: (id: string | null) => void
  onToggle: (id: string) => void
  onExpandedChange?: (expanded: Set<string>) => void
  onEditNode?: (id: string) => void
  onDeleteNode?: (id: string) => void
}

function getVisibleNodeIds<T extends TreeNode>(nodes: T[], expanded: Set<string>): string[] {
  const result: string[] = []
  for (const node of nodes) {
    result.push(node.id)
    if (node.children && expanded.has(node.id)) {
      result.push(...getVisibleNodeIds(node.children as T[], expanded))
    }
  }
  return result
}

function findNodeById<T extends TreeNode>(nodes: T[], id: string): T | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children as T[], id)
      if (found) return found
    }
  }
  return null
}

function findParentById<T extends TreeNode>(nodes: T[], id: string): T | null {
  for (const node of nodes) {
    if (node.children) {
      for (const child of node.children as T[]) {
        if (child.id === id) return node
      }
      const found = findParentById(node.children as T[], id)
      if (found) return found
    }
  }
  return null
}

export function useTreeKeyboard<T extends TreeNode>({
  nodes,
  expanded,
  selectedId,
  onSelect,
  onToggle,
  onExpandedChange,
  onEditNode,
  onDeleteNode,
}: UseTreeKeyboardOptions<T>) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const visibleIds = getVisibleNodeIds(nodes, expanded)
      if (visibleIds.length === 0) return

      const currentIndex = selectedId ? visibleIds.indexOf(selectedId) : -1
      const currentId = selectedId

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          const nextIndex = currentIndex >= 0 ? Math.min(currentIndex + 1, visibleIds.length - 1) : 0
          onSelect(visibleIds[nextIndex])
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0
          onSelect(visibleIds[prevIndex])
          break
        }
        case 'ArrowRight': {
          event.preventDefault()
          if (!currentId) {
            onSelect(visibleIds[0])
            return
          }
          const node = findNodeById(nodes, currentId)
          if (!node || !node.children || node.children.length === 0) return
          if (!expanded.has(currentId)) {
            onToggle(currentId)
          } else {
            onSelect(node.children[0].id)
          }
          break
        }
        case 'ArrowLeft': {
          event.preventDefault()
          if (!currentId) return
          if (expanded.has(currentId)) {
            onToggle(currentId)
          } else {
            const parent = findParentById(nodes, currentId)
            if (parent) {
              onSelect(parent.id)
            }
          }
          break
        }
        case 'Home': {
          event.preventDefault()
          onSelect(visibleIds[0])
          break
        }
        case 'End': {
          event.preventDefault()
          onSelect(visibleIds[visibleIds.length - 1])
          break
        }
        case '*': {
          event.preventDefault()
          if (!currentId) return
          const parent = findParentById(nodes, currentId)
          const siblings = parent ? (parent.children as T[]) ?? [] : nodes
          const next = new Set(expanded)
          let changed = false
          for (const sibling of siblings) {
            if (sibling.children && sibling.children.length > 0 && !next.has(sibling.id)) {
              next.add(sibling.id)
              changed = true
            }
          }
          if (changed) {
            onExpandedChange?.(next)
          }
          break
        }
        case 'F2': {
          event.preventDefault()
          if (currentId && onEditNode) {
            onEditNode(currentId)
          }
          break
        }
        case 'Delete': {
          event.preventDefault()
          if (currentId && onDeleteNode) {
            onDeleteNode(currentId)
          }
          break
        }
      }
    },
    [nodes, expanded, selectedId, onSelect, onToggle, onExpandedChange, onEditNode, onDeleteNode],
  )

  return { handleKeyDown }
}
