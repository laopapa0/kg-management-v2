import { describe, it, expect } from 'vitest'
import { applyDragOperation } from './treeDragHelpers'
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'

function makeIndicator(id: string, treeParentId?: string): IndicatorAttachment {
  return {
    id,
    name: id,
    code: id,
    indicatorCode: '',
    indicatorDisplayName: id,
    indicatorShowName: id,
    indicatorType: '虚拟分组',
    level1: '',
    level2: '',
    granularity: '',
    frequency: '',
    unit: '',
    isBigScreen: false,
    department: '',
    businessCaliber: '',
    techCaliber: '',
    tags: [],
    treeParentId,
    tagIds: [],
    ruleIds: [],
  }
}

describe('applyDragOperation', () => {
  it('moves dragged node inside target node', () => {
    const indicators = [
      makeIndicator('a'),
      makeIndicator('b'),
      makeIndicator('c', 'a'),
    ]

    const result = applyDragOperation(indicators, 'b', 'a', 'inside')

    expect(result.find((i) => i.id === 'b')?.treeParentId).toBe('a')
  })

  it('moves dragged node to same level as target (before)', () => {
    const indicators = [
      makeIndicator('a'),
      makeIndicator('b', 'a'),
      makeIndicator('c', 'a'),
    ]

    const result = applyDragOperation(indicators, 'c', 'b', 'before')

    expect(result.find((i) => i.id === 'c')?.treeParentId).toBe('a')
  })

  it('moves dragged node to same level as target (after)', () => {
    const indicators = [
      makeIndicator('a'),
      makeIndicator('b', 'a'),
      makeIndicator('c', 'a'),
    ]

    const result = applyDragOperation(indicators, 'c', 'b', 'after')

    expect(result.find((i) => i.id === 'c')?.treeParentId).toBe('a')
  })

  it('returns original array when dragged and target are the same', () => {
    const indicators = [makeIndicator('a'), makeIndicator('b')]
    const result = applyDragOperation(indicators, 'a', 'a', 'inside')
    expect(result).toBe(indicators)
  })

  it('returns original array when target is a descendant of dragged', () => {
    const indicators = [
      makeIndicator('a'),
      makeIndicator('b', 'a'),
      makeIndicator('c', 'b'),
    ]

    const result = applyDragOperation(indicators, 'a', 'c', 'inside')

    expect(result).toBe(indicators)
    expect(result.find((i) => i.id === 'a')?.treeParentId).toBeUndefined()
  })

  it('clears treeParentId when target is root-level and position is before/after', () => {
    const indicators = [
      makeIndicator('a'),
      makeIndicator('b', 'a'),
      makeIndicator('c'),
    ]

    const result = applyDragOperation(indicators, 'b', 'c', 'before')

    expect(result.find((i) => i.id === 'b')?.treeParentId).toBeUndefined()
  })

  it('does not modify other nodes', () => {
    const indicators = [
      makeIndicator('a'),
      makeIndicator('b'),
      makeIndicator('c', 'a'),
    ]

    const result = applyDragOperation(indicators, 'b', 'a', 'inside')

    expect(result.find((i) => i.id === 'a')?.treeParentId).toBeUndefined()
    expect(result.find((i) => i.id === 'c')?.treeParentId).toBe('a')
  })
})
