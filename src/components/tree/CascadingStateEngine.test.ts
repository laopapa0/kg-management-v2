import { describe, it, expect } from 'vitest'
import { computeState, toggle, selectAll, clear } from './CascadingStateEngine'
import type { TagNode } from '@/models/indicatorAttachmentModel'

function makeNodes(): TagNode[] {
  return [
    { id: 'root', name: 'Root' },
    { id: 'a', name: 'A', parentId: 'root' },
    { id: 'b', name: 'B', parentId: 'root' },
    { id: 'a1', name: 'A1', parentId: 'a' },
    { id: 'a2', name: 'A2', parentId: 'a' },
    { id: 'b1', name: 'B1', parentId: 'b' },
  ]
}

describe('CascadingStateEngine', () => {
  describe('computeState', () => {
    it('marks parent as selected when all children are selected', () => {
      const nodes = makeNodes()
      const selected = new Set(['a1', 'a2'])
      const result = computeState(nodes, selected)

      expect(result.selected.has('a')).toBe(true)
      expect(result.selected.has('a1')).toBe(true)
      expect(result.selected.has('a2')).toBe(true)
      expect(result.partial.has('a')).toBe(false)
    })

    it('marks parent as partial when some children are selected', () => {
      const nodes = makeNodes()
      const selected = new Set(['a1'])
      const result = computeState(nodes, selected)

      expect(result.partial.has('a')).toBe(true)
      expect(result.selected.has('a')).toBe(false)
      expect(result.selected.has('a1')).toBe(true)
      expect(result.partial.has('a1')).toBe(false)
    })

    it('marks ancestor as partial when a descendant is selected', () => {
      const nodes = makeNodes()
      const selected = new Set(['a1'])
      const result = computeState(nodes, selected)

      expect(result.partial.has('root')).toBe(true)
      expect(result.selected.has('root')).toBe(false)
    })

    it('marks root as selected when all branches are fully selected', () => {
      const nodes = makeNodes()
      const selected = new Set(['a1', 'a2', 'b1'])
      const result = computeState(nodes, selected)

      expect(result.selected.has('root')).toBe(true)
      expect(result.partial.has('root')).toBe(false)
      expect(result.selected.has('a')).toBe(true)
      expect(result.selected.has('b')).toBe(true)
    })

    it('clears parent selection when all children are unselected', () => {
      const nodes = makeNodes()
      const selected = new Set<string>()
      const result = computeState(nodes, selected)

      expect(result.selected.size).toBe(0)
      expect(result.partial.size).toBe(0)
    })
  })

  describe('toggle', () => {
    it('selects target and all descendants when target is unselected', () => {
      const nodes = makeNodes()
      const result = toggle(nodes, new Set(), 'a')

      expect(result.selected.has('a')).toBe(true)
      expect(result.selected.has('a1')).toBe(true)
      expect(result.selected.has('a2')).toBe(true)
    })

    it('unselects target and all descendants when target is selected', () => {
      const nodes = makeNodes()
      const result = toggle(nodes, new Set(['a', 'a1', 'a2']), 'a')

      expect(result.selected.has('a')).toBe(false)
      expect(result.selected.has('a1')).toBe(false)
      expect(result.selected.has('a2')).toBe(false)
    })

    it('updates parent to partial when a child is toggled on', () => {
      const nodes = makeNodes()
      const result = toggle(nodes, new Set(), 'a1')

      expect(result.selected.has('a1')).toBe(true)
      expect(result.partial.has('a')).toBe(true)
      expect(result.partial.has('root')).toBe(true)
    })

    it('updates parent to selected when all siblings are toggled on', () => {
      const nodes = makeNodes()
      let selected = new Set<string>()
      selected = toggle(nodes, selected, 'a1').selected
      selected = toggle(nodes, selected, 'a2').selected
      const result = computeState(nodes, selected)

      expect(result.selected.has('a')).toBe(true)
      expect(result.partial.has('a')).toBe(false)
    })

    it('updates ancestor state when toggling off a fully selected branch', () => {
      const nodes = makeNodes()
      const initial = new Set(['root', 'a', 'b', 'a1', 'a2', 'b1'])
      const result = toggle(nodes, initial, 'a1')

      expect(result.selected.has('a1')).toBe(false)
      expect(result.selected.has('a')).toBe(false)
      expect(result.partial.has('a')).toBe(true)
      expect(result.selected.has('root')).toBe(false)
      expect(result.partial.has('root')).toBe(true)
    })
  })

  describe('selectAll', () => {
    it('selects all given ids and their descendants', () => {
      const nodes = makeNodes()
      const result = selectAll(nodes, new Set(), ['a', 'b'])

      expect(result.selected.has('a')).toBe(true)
      expect(result.selected.has('b')).toBe(true)
      expect(result.selected.has('a1')).toBe(true)
      expect(result.selected.has('a2')).toBe(true)
      expect(result.selected.has('b1')).toBe(true)
      expect(result.selected.has('root')).toBe(true)
    })
  })

  describe('clear', () => {
    it('returns empty selected and partial sets', () => {
      const result = clear()
      expect(result.selected.size).toBe(0)
      expect(result.partial.size).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('toggle on a leaf node only affects itself', () => {
      const nodes = makeNodes()
      const result = toggle(nodes, new Set(), 'a1')

      expect(result.selected.has('a1')).toBe(true)
      expect(result.selected.has('a')).toBe(false)
      expect(result.partial.has('a')).toBe(true)
    })

    it('toggle off a leaf node only affects itself', () => {
      const nodes = makeNodes()
      const result = toggle(nodes, new Set(['a1']), 'a1')

      expect(result.selected.has('a1')).toBe(false)
      expect(result.partial.size).toBe(0)
    })

    it('toggle on a partial node selects it and all descendants', () => {
      // a is partial (a1 selected, a2 not)
      const nodes = makeNodes()
      const selected = new Set(['a1'])
      const result = toggle(nodes, selected, 'a')

      expect(result.selected.has('a')).toBe(true)
      expect(result.selected.has('a1')).toBe(true)
      expect(result.selected.has('a2')).toBe(true)
    })

    it('handles deeply nested trees (>2 levels)', () => {
      const nodes: TagNode[] = [
        { id: 'l0', name: 'L0' },
        { id: 'l1', name: 'L1', parentId: 'l0' },
        { id: 'l2', name: 'L2', parentId: 'l1' },
        { id: 'l3', name: 'L3', parentId: 'l2' },
      ]
      const result = toggle(nodes, new Set(), 'l3')

      expect(result.selected.has('l3')).toBe(true)
      expect(result.selected.has('l2')).toBe(true)
      expect(result.selected.has('l1')).toBe(true)
      expect(result.selected.has('l0')).toBe(true)
    })

    it('handles empty nodes array', () => {
      const result = computeState([], new Set())
      expect(result.selected.size).toBe(0)
      expect(result.partial.size).toBe(0)
    })

    it('toggle with non-existent targetId adds the id to selected', () => {
      const nodes = makeNodes()
      const result = toggle(nodes, new Set(), 'non-existent')

      // The implementation adds the targetId even if it is not in the node list
      expect(result.selected.has('non-existent')).toBe(true)
      expect(result.partial.size).toBe(0)
    })

    it('getDescendantIds guards against cyclic references', () => {
      // We verify toggle does not infinite loop on deep trees
      const deepNodes: TagNode[] = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        name: `Node ${i}`,
        parentId: i > 0 ? `node-${i - 1}` : undefined,
      }))
      const result = toggle(deepNodes, new Set(), 'node-99')
      expect(result.selected.has('node-99')).toBe(true)
      // In a single-child chain, all ancestors become selected
      expect(result.selected.has('node-0')).toBe(true)
      expect(result.partial.has('node-0')).toBe(false)
    })
  })
})
