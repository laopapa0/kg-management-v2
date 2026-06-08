import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDepartments,
  getIndicators,
  getTagNodes,
  getRules,
  getRuleParameters,
  getUiState,
  __resetAttachmentStorageCache,
} from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore, selectPendingIndicators } from './attachmentStore'
import { createMinimalIndicatorAttachment } from '@/models/indicatorAttachmentModel'

const mockStorage = {
  departments: [
    { id: 'dept-finance', name: '财务部' },
    { id: 'dept-market', name: '市场部' },
  ],
}

describe('attachmentStore', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
  })

  it('initializes with empty data before init() is called', () => {
    const state = useAttachmentStore.getState()

    expect(state.departments).toEqual([])
    expect(state.currentDepartmentId).toBeNull()
    expect(state.indicators).toEqual([])
    expect(state.tagNodes).toEqual([])
    expect(state.rules).toEqual([])
    expect(state.ruleParameters).toEqual([])
    expect(state.connectionMode).toBe(false)
    expect(state.uiState).toEqual({})
    expect(state.canUndo).toBe(false)
    expect(state.canRedo).toBe(false)
  })

  it('loads data from attachmentStorage during init()', () => {
    localStorage.setItem('kgv2-attachment-data-version', '2')
    localStorage.setItem('kgv2-attachment-departments', JSON.stringify(mockStorage.departments))
    localStorage.setItem(
      'kgv2-attachment-indicators-dept-finance',
      JSON.stringify([{ id: 'ind-001', name: '测试指标' }]),
    )

    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    expect(state.departments).toEqual(mockStorage.departments)
    expect(state.currentDepartmentId).toBe('dept-finance')
    expect(state.indicators.length).toBeGreaterThanOrEqual(1)
  })

  it('injects mock data when storage is empty', () => {
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    expect(state.departments.length).toBeGreaterThanOrEqual(2)
    expect(state.indicators.length).toBeGreaterThanOrEqual(20)
    expect(state.tagNodes.length).toBeGreaterThanOrEqual(5)
    expect(state.rules.length).toBeGreaterThanOrEqual(3)
  })

  it('switches current department and loads its data', () => {
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    state.setCurrentDepartmentId('dept-市场部')

    const next = useAttachmentStore.getState()
    expect(next.currentDepartmentId).toBe('dept-市场部')
    expect(next.indicators.length).toBeGreaterThanOrEqual(1)
    expect(next.tagNodes.length).toBeGreaterThanOrEqual(1)
  })

  it('persists indicators to storage when they change', () => {
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    const original = state.indicators
    state.setIndicators([...original, { id: 'ind-new', name: '新增指标' } as typeof original[number]])

    const stored = getIndicators(state.currentDepartmentId!)
    expect(stored.some((i) => i.id === 'ind-new')).toBe(true)
  })

  it('persists tag nodes to storage when they change', () => {
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    state.setTagNodes([{ id: 'tag-new', name: '新标签' }])

    const stored = getTagNodes(state.currentDepartmentId!)
    expect(stored.some((t) => t.id === 'tag-new')).toBe(true)
  })

  it('persists rules and rule parameters to storage when they change', () => {
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    state.setRules([{ id: 'rule-new', name: '新规则', type: 'threshold' }])
    state.setRuleParameters([{ ruleId: 'rule-new', indicatorId: 'ind-001' }])

    expect(getRules().some((r) => r.id === 'rule-new')).toBe(true)
    expect(getRuleParameters().some((p) => p.ruleId === 'rule-new')).toBe(true)
  })

  it('persists ui state to storage when it changes', () => {
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    state.setUiState({ selectedIndicatorIds: ['ind-001'] })

    expect(getUiState().selectedIndicatorIds).toContain('ind-001')
  })

  it('toggles connection mode', () => {
    initializeAttachmentStore()

    useAttachmentStore.getState().setConnectionMode(true)
    expect(useAttachmentStore.getState().connectionMode).toBe(true)

    useAttachmentStore.getState().setConnectionMode(false)
    expect(useAttachmentStore.getState().connectionMode).toBe(false)
  })

  it('does not auto-inject mock data if storage already has departments', () => {
    localStorage.setItem('kgv2-attachment-data-version', '2')
    localStorage.setItem('kgv2-attachment-departments', JSON.stringify(mockStorage.departments))
    localStorage.setItem('kgv2-attachment-indicators-dept-finance', JSON.stringify([]))
    localStorage.setItem('kgv2-attachment-tagnodes-dept-finance', JSON.stringify([]))

    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    expect(state.departments).toEqual(mockStorage.departments)
    expect(state.indicators).toEqual([])
    expect(state.tagNodes).toEqual([])
  })

  describe('undo/redo', () => {
    it('tracks canUndo after a data mutation', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      expect(state.canUndo).toBe(false)
      state.setIndicators([...state.indicators, { id: 'ind-x', name: 'X' } as typeof state.indicators[number]])

      expect(useAttachmentStore.getState().canUndo).toBe(true)
    })

    it('undo restores previous indicators', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const originalLength = state.indicators.length

      state.setIndicators([...state.indicators, { id: 'ind-undo-test', name: 'Undo Test' } as typeof state.indicators[number]])
      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength + 1)

      useAttachmentStore.getState().undo()
      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength)
      expect(useAttachmentStore.getState().indicators.some((i) => i.id === 'ind-undo-test')).toBe(false)
    })

    it('redo restores undone state', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const originalLength = state.indicators.length

      state.setIndicators([...state.indicators, { id: 'ind-redo-test', name: 'Redo Test' } as typeof state.indicators[number]])
      useAttachmentStore.getState().undo()
      expect(useAttachmentStore.getState().canRedo).toBe(true)

      useAttachmentStore.getState().redo()
      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength + 1)
      expect(useAttachmentStore.getState().indicators.some((i) => i.id === 'ind-redo-test')).toBe(true)
    })

    it('clears redoStack when a new mutation happens after undo', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      state.setIndicators([...state.indicators, { id: 'ind-a', name: 'A' } as typeof state.indicators[number]])
      useAttachmentStore.getState().undo()
      expect(useAttachmentStore.getState().canRedo).toBe(true)

      useAttachmentStore.getState().setIndicators([...useAttachmentStore.getState().indicators, { id: 'ind-b', name: 'B' } as typeof state.indicators[number]])
      expect(useAttachmentStore.getState().canRedo).toBe(false)
    })

    it('undo works for tagNodes, rules and ruleParameters', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      state.setRules([{ id: 'rule-undo', name: 'Rule Undo', type: 'threshold' }])
      expect(useAttachmentStore.getState().rules.some((r) => r.id === 'rule-undo')).toBe(true)

      useAttachmentStore.getState().undo()
      expect(useAttachmentStore.getState().rules.some((r) => r.id === 'rule-undo')).toBe(false)
    })

    it('does not throw when undo is called on empty stack', () => {
      initializeAttachmentStore()
      expect(() => useAttachmentStore.getState().undo()).not.toThrow()
    })

    it('does not throw when redo is called on empty stack', () => {
      initializeAttachmentStore()
      expect(() => useAttachmentStore.getState().redo()).not.toThrow()
    })

    it('caps undo stack size', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      for (let i = 0; i < 52; i++) {
        state.setIndicators([...useAttachmentStore.getState().indicators, { id: `ind-${i}`, name: `${i}` } as typeof state.indicators[number]])
      }

      expect(useAttachmentStore.getState().undoStack.length).toBeLessThanOrEqual(50)
    })

    it('handleKeyDown triggers undo on Ctrl+Z', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      state.setIndicators([...state.indicators, { id: 'ind-key', name: 'Key' } as typeof state.indicators[number]])

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
      useAttachmentStore.getState().handleKeyDown(event)

      expect(useAttachmentStore.getState().indicators.some((i) => i.id === 'ind-key')).toBe(false)
    })

    it('handleKeyDown triggers redo on Ctrl+Shift+Z', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      state.setIndicators([...state.indicators, { id: 'ind-key', name: 'Key' } as typeof state.indicators[number]])
      useAttachmentStore.getState().undo()

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true })
      useAttachmentStore.getState().handleKeyDown(event)

      expect(useAttachmentStore.getState().indicators.some((i) => i.id === 'ind-key')).toBe(true)
    })

    it('handleKeyDown prevents default for undo/redo shortcuts', () => {
      initializeAttachmentStore()
      const undoEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true })
      useAttachmentStore.getState().handleKeyDown(undoEvent)
      expect(undoEvent.defaultPrevented).toBe(true)
    })
  })

  describe('indicator CRUD', () => {
    it('adds a new indicator tree node', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const originalLength = state.indicators.length

      state.addIndicator('新分组节点')

      const next = useAttachmentStore.getState()
      expect(next.indicators.length).toBe(originalLength + 1)
      expect(next.indicators.some((i) => i.name === '新分组节点')).toBe(true)
    })

    it('pushes history when adding an indicator', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      expect(state.canUndo).toBe(false)
      state.addIndicator('新分组节点')

      expect(useAttachmentStore.getState().canUndo).toBe(true)
    })

    it('adds an indicator with parentId when provided', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const parent = state.indicators[0]

      state.addIndicator('子节点', parent.id)

      const child = useAttachmentStore.getState().indicators.find((i) => i.name === '子节点')
      expect(child).toBeDefined()
      expect(child!.treeParentId).toBe(parent.id)
    })

    it('persists added indicator to storage', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      state.addIndicator('持久化节点')

      const stored = getIndicators(state.currentDepartmentId!)
      expect(stored.some((i) => i.name === '持久化节点')).toBe(true)
    })

    it('renames an existing indicator', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const target = state.indicators[0]

      state.renameIndicator(target.id, '重命名后')

      const renamed = useAttachmentStore.getState().indicators.find((i) => i.id === target.id)
      expect(renamed?.name).toBe('重命名后')
    })

    it('pushes history when renaming an indicator', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const target = state.indicators[0]

      expect(state.canUndo).toBe(false)
      state.renameIndicator(target.id, '重命名后')

      expect(useAttachmentStore.getState().canUndo).toBe(true)
    })

    it('does not rename when target id is not found', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const originalLength = state.indicators.length

      state.renameIndicator('non-existent', '新名称')

      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength)
      expect(useAttachmentStore.getState().canUndo).toBe(false)
    })

    it('deletes an indicator by id', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const target = state.indicators[0]
      const originalLength = state.indicators.length

      state.deleteIndicator(target.id)

      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength - 1)
      expect(useAttachmentStore.getState().indicators.some((i) => i.id === target.id)).toBe(false)
    })

    it('pushes history when deleting an indicator', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const target = state.indicators[0]

      expect(state.canUndo).toBe(false)
      state.deleteIndicator(target.id)

      expect(useAttachmentStore.getState().canUndo).toBe(true)
    })

    it('does not delete when target id is not found', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const originalLength = state.indicators.length

      state.deleteIndicator('non-existent')

      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength)
      expect(useAttachmentStore.getState().canUndo).toBe(false)
    })

    it('clears treeParentId of children when deleting a parent node', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const parent = state.indicators[0]
      const child = state.indicators[1]

      state.setIndicators(
        state.indicators.map((i) => (i.id === child.id ? { ...i, treeParentId: parent.id } : i)),
      )

      state.deleteIndicator(parent.id)

      const updatedChild = useAttachmentStore.getState().indicators.find((i) => i.id === child.id)
      expect(updatedChild?.treeParentId).toBeUndefined()
    })

    it('deleteIndicatorTree removes parent and all descendants', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const parent = state.indicators[0]
      const child = state.indicators[1]
      const grandchild = state.indicators[2]

      // Clear default treeParentIds, then build tree: parent -> child -> grandchild
      state.setIndicators(
        state.indicators.map((i) => {
          if (i.id === child.id) return { ...i, treeParentId: parent.id }
          if (i.id === grandchild.id) return { ...i, treeParentId: child.id }
          return { ...i, treeParentId: undefined }
        }),
      )
      const originalLength = state.indicators.length

      state.deleteIndicatorTree(parent.id)

      const remaining = useAttachmentStore.getState().indicators
      expect(remaining.length).toBe(originalLength - 3)
      expect(remaining.some((i) => i.id === parent.id)).toBe(false)
      expect(remaining.some((i) => i.id === child.id)).toBe(false)
      expect(remaining.some((i) => i.id === grandchild.id)).toBe(false)
    })

    it('deleteIndicatorTree pushes history', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const parent = state.indicators[0]

      expect(state.canUndo).toBe(false)
      state.deleteIndicatorTree(parent.id)

      expect(useAttachmentStore.getState().canUndo).toBe(true)
    })

    it('does not deleteIndicatorTree when target id is not found', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const originalLength = state.indicators.length

      state.deleteIndicatorTree('non-existent')

      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength)
      expect(useAttachmentStore.getState().canUndo).toBe(false)
    })

    it('undo restores entire subtree after deleteIndicatorTree', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const parent = state.indicators[0]
      const child = state.indicators[1]

      // Clear default treeParentIds, then build simple parent -> child tree
      state.setIndicators(
        state.indicators.map((i) =>
          i.id === child.id ? { ...i, treeParentId: parent.id } : { ...i, treeParentId: undefined },
        ),
      )
      const originalLength = state.indicators.length

      state.deleteIndicatorTree(parent.id)
      expect(useAttachmentStore.getState().indicators.length).toBe(originalLength - 2)

      state.undo()

      const restored = useAttachmentStore.getState().indicators
      expect(restored.length).toBe(originalLength)
      expect(restored.some((i) => i.id === parent.id)).toBe(true)
      expect(restored.some((i) => i.id === child.id)).toBe(true)
      expect(restored.find((i) => i.id === child.id)?.treeParentId).toBe(parent.id)
    })
  })

  describe('selectPendingIndicators', () => {
    it('excludes virtual grouping nodes even without treeParentId and attachments', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      // createMinimalIndicatorAttachment creates a virtual grouping node
      // with indicatorType === '虚拟分组', treeParentId undefined, tagIds [], ruleIds []
      const virtualNode = createMinimalIndicatorAttachment('虚拟分组测试')

      state.setIndicators([...state.indicators, virtualNode])

      const pending = selectPendingIndicators(useAttachmentStore.getState())
      expect(pending.some((i) => i.id === virtualNode.id)).toBe(false)
    })

    it('includes real indicators that have no treeParentId and no attachments', () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      // Find a real indicator (not virtual grouping) with no parent and no attachments
      const realIndicator = state.indicators.find(
        (i) =>
          i.indicatorType !== '虚拟分组' &&
          !i.treeParentId &&
          i.tagIds.length === 0 &&
          i.ruleIds.length === 0,
      )

      // If no such indicator exists in mock data, create one manually
      if (!realIndicator) {
        const manualIndicator = {
          ...createMinimalIndicatorAttachment('真实指标'),
          indicatorType: '真实指标',
          code: 'REAL-001',
        }
        state.setIndicators([...state.indicators, manualIndicator])
        const pending = selectPendingIndicators(useAttachmentStore.getState())
        expect(pending.some((i) => i.id === manualIndicator.id)).toBe(true)
      } else {
        const pending = selectPendingIndicators(state)
        expect(pending.some((i) => i.id === realIndicator.id)).toBe(true)
      }
    })
  })
})
