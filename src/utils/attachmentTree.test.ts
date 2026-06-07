import { describe, it, expect } from 'vitest'
import { buildIndicatorTree, walkNodes, walkRules } from './attachmentTree'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'

describe('attachmentTree', () => {
  describe('buildIndicatorTree', () => {
    it('returns roots for nodes without treeParentId', () => {
      const flat: IndicatorAttachment[] = [
        { id: 'ind-1', name: '指标 1', treeParentId: undefined, tagIds: [], ruleIds: [] } as IndicatorAttachment,
      ]
      const tree = buildIndicatorTree(flat)
      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('ind-1')
    })

    it('nests children under their treeParentId', () => {
      const flat: IndicatorAttachment[] = [
        { id: 'ind-1', name: '父指标', treeParentId: undefined, tagIds: [], ruleIds: [] } as IndicatorAttachment,
        { id: 'ind-2', name: '子指标', treeParentId: 'ind-1', tagIds: [], ruleIds: [] } as IndicatorAttachment,
      ]
      const tree = buildIndicatorTree(flat)
      expect(tree[0].children).toHaveLength(1)
      expect(tree[0].children![0].id).toBe('ind-2')
    })

    it('promotes orphan nodes to roots', () => {
      const flat: IndicatorAttachment[] = [
        { id: 'ind-1', name: '指标', treeParentId: 'missing', tagIds: [], ruleIds: [] } as IndicatorAttachment,
      ]
      const tree = buildIndicatorTree(flat)
      expect(tree).toHaveLength(1)
    })
  })

  describe('walkNodes', () => {
    it('visits every node in depth-first order', () => {
      const nodes = [
        { id: 'a', children: [{ id: 'a1', children: [{ id: 'a1-1' }] }] },
        { id: 'b' },
      ]
      const visited: string[] = []
      walkNodes(nodes, (node) => visited.push(node.id))
      expect(visited).toEqual(['a', 'a1', 'a1-1', 'b'])
    })
  })

  describe('walkRules', () => {
    it('visits every rule node', () => {
      const rules = [
        { id: 'r1', name: '规则 1', type: 'threshold' as const, children: [{ id: 'r1-1', name: '子规则', type: 'threshold' as const }] },
      ]
      const visited: string[] = []
      walkRules(rules, (node) => visited.push(node.id))
      expect(visited).toEqual(['r1', 'r1-1'])
    })
  })
})
