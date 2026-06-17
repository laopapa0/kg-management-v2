import { describe, it, expect } from 'vitest'
import { mockLinkRelations, mockAiRecommendations, mockLinkUsages } from '@/models/linkRelationModel'

const VALID_TYPES = ['AGGREGATES', 'DRIVES', 'DEPENDS_ON', 'CAUSES', 'TRANSMISSION']

describe('linkRelationModel — 血缘关系类型', () => {
  it('只保留 5 种启用的关系类型', () => {
    const enabled = mockLinkRelations.filter((r) => r.enabled)
    expect(enabled).toHaveLength(5)
    const names = enabled.map((r) => r.name)
    VALID_TYPES.forEach((t) => expect(names).toContain(t))
  })

  it('已被移除的类型 enabled 为 false', () => {
    const disabled = mockLinkRelations.filter((r) => !r.enabled)
    const disabledNames = disabled.map((r) => r.name)
    expect(disabledNames).toContain('CORRELATES')
    expect(disabledNames).toContain('DERIVES')
    expect(disabledNames).toContain('PART_OF')
    expect(disabledNames).toContain('REPLACES')
    expect(disabledNames).toContain('REFERENCES')
  })
})

describe('linkRelationModel — AI 推荐数据', () => {
  it('AI 推荐 Tab 有 25 条未应用关系', () => {
    expect(mockAiRecommendations).toHaveLength(25)
  })

  it('已应用连线 relationTypeId 均为 5 种有效类型', () => {
    const types = new Set(mockLinkUsages.flatMap((u) => u.connections.map(() => ''))) 
    // Check the actual relation IDs match valid types
    const relationIds = mockLinkUsages.map((u) => u.relationId)
    relationIds.forEach((id) => {
      // Each usage should reference a valid relation type
      expect(mockLinkRelations.some((r) => r.id === id && r.enabled)).toBe(true)
    })
  })

  it('AI 推荐 relationTypeId 均为有效类型', () => {
    mockAiRecommendations.forEach((rec) => {
      expect(VALID_TYPES).toContain(rec.relationTypeId)
    })
  })
})
