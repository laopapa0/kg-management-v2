import { describe, it, expect, beforeEach } from 'vitest'
import {
  addExcludedRelation,
  removeExcludedRelation,
  getExcludedRelations,
} from '@/utils/lineageExcludedStorage'

const LS_KEY = 'kgv2-excluded-relation-ids'

describe('血缘画布删除联动 localStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('addExcludedRelation', () => {
    it('将关系 ID 追加到 excludedIds 数组', () => {
      addExcludedRelation('REL-001')
      expect(getExcludedRelations()).toEqual(['REL-001'])
    })

    it('重复添加同一 ID 不会重复', () => {
      addExcludedRelation('REL-001')
      addExcludedRelation('REL-001')
      expect(getExcludedRelations()).toEqual(['REL-001'])
    })

    it('多次删除累积所有 ID', () => {
      addExcludedRelation('REL-001')
      addExcludedRelation('REL-005')
      addExcludedRelation('REL-013')
      expect(getExcludedRelations()).toEqual(['REL-001', 'REL-005', 'REL-013'])
    })

    it('localStorage 无此 key 时自动初始化为空数组', () => {
      addExcludedRelation('REL-043')
      expect(getExcludedRelations()).toEqual(['REL-043'])
    })
  })

  describe('removeExcludedRelation', () => {
    it('从 excludedIds 数组中移除指定 ID', () => {
      localStorage.setItem(LS_KEY, JSON.stringify(['REL-001', 'REL-005']))
      removeExcludedRelation('REL-001')
      expect(getExcludedRelations()).toEqual(['REL-005'])
    })

    it('移除不存在的 ID 不报错', () => {
      localStorage.setItem(LS_KEY, JSON.stringify(['REL-001']))
      removeExcludedRelation('REL-999')
      expect(getExcludedRelations()).toEqual(['REL-001'])
    })

    it('移除最后一个 ID 后数组变空', () => {
      localStorage.setItem(LS_KEY, JSON.stringify(['REL-001']))
      removeExcludedRelation('REL-001')
      expect(getExcludedRelations()).toEqual([])
    })
  })

  describe('完整删除-恢复循环', () => {
    it('删除后排除，恢复后重新出现', () => {
      addExcludedRelation('REL-013')
      expect(getExcludedRelations()).toContain('REL-013')

      removeExcludedRelation('REL-013')
      expect(getExcludedRelations()).not.toContain('REL-013')
    })

    it('多次删除恢复后数组保持正确', () => {
      addExcludedRelation('REL-001')
      addExcludedRelation('REL-005')
      removeExcludedRelation('REL-001')
      addExcludedRelation('REL-001')
      expect(getExcludedRelations()).toEqual(['REL-005', 'REL-001'])
    })
  })
})
