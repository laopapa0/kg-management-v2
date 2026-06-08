import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAttachmentStore } from '@/stores/attachmentStore'
import { createIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { useConnectionDelete } from './useConnectionDelete'

describe('useConnectionDelete', () => {
  function createTestIndicator(overrides: {
    id: string
    treeParentId?: string
    tagIds?: string[]
    ruleIds?: string[]
  }) {
    return createIndicatorAttachment({
      id: overrides.id,
      name: `指标${overrides.id}`,
      code: `CODE-${overrides.id}`,
      indicatorCode: `CODE-${overrides.id}`,
      indicatorDisplayName: `指标${overrides.id}`,
      indicatorShowName: `指标${overrides.id}`,
      indicatorType: '基础指标',
      level1: '经营',
      level2: '收入',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: '财务部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      treeParentId: overrides.treeParentId,
      tagIds: overrides.tagIds ?? [],
      ruleIds: overrides.ruleIds ?? [],
    })
  }

  beforeEach(() => {
    useAttachmentStore.setState({
      ...useAttachmentStore.getState(),
      indicators: [
        createTestIndicator({
          id: 'ind-1',
          treeParentId: 'tree-1',
          tagIds: ['tag-1'],
          ruleIds: ['rule-1'],
        }),
      ],
    })
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deletes tree attachment by clearing treeParentId', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tree-1' })
    })

    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.treeParentId).toBeUndefined()
  })

  it('deletes tag attachment by removing targetId from tagIds', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tag-1' })
    })

    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.tagIds).not.toContain('tag-1')
    expect(indicator?.tagIds).toHaveLength(0)
  })

  it('deletes rule attachment by removing targetId from ruleIds', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'rule-1' })
    })

    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.ruleIds).not.toContain('rule-1')
    expect(indicator?.ruleIds).toHaveLength(0)
  })

  it('sets lastDeleted with previous state', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tree-1' })
    })

    expect(result.current.lastDeleted).not.toBeNull()
    expect(result.current.lastDeleted?.sourceId).toBe('ind-1')
    expect(result.current.lastDeleted?.targetId).toBe('tree-1')
    expect(result.current.lastDeleted?.previousTreeParentId).toBe('tree-1')
    expect(result.current.lastDeleted?.previousTagIds).toEqual(['tag-1'])
    expect(result.current.lastDeleted?.previousRuleIds).toEqual(['rule-1'])
  })

  it('undoes deletion by restoring previous treeParentId', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tree-1' })
    })

    act(() => {
      result.current.undoDelete()
    })

    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.treeParentId).toBe('tree-1')
  })

  it('undoes deletion by restoring previous tagIds', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tag-1' })
    })

    act(() => {
      result.current.undoDelete()
    })

    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.tagIds).toContain('tag-1')
  })

  it('undoes deletion by restoring previous ruleIds', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'rule-1' })
    })

    act(() => {
      result.current.undoDelete()
    })

    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.ruleIds).toContain('rule-1')
  })

  it('clears lastDeleted after 5 seconds', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tree-1' })
    })

    expect(result.current.lastDeleted).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.lastDeleted).toBeNull()
  })

  it('does nothing when undo is called without lastDeleted', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.undoDelete()
    })

    expect(result.current.lastDeleted).toBeNull()
  })

  it('resets timer when deleting again before timeout', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tree-1' })
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.lastDeleted).not.toBeNull()

    // Delete another connection — should reset timer
    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tag-1' })
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // First timer would have expired at 5s, but second timer resets it
    // At 6s (3s + 3s), second timer still has 2s left
    expect(result.current.lastDeleted).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.lastDeleted).toBeNull()
  })

  it('does nothing when target is not found on indicator', () => {
    const { result } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'non-existent' })
    })

    expect(result.current.lastDeleted).toBeNull()
    const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-1')
    expect(indicator?.treeParentId).toBe('tree-1')
  })

  it('clears pending timer on unmount', () => {
    const { result, unmount } = renderHook(() => useConnectionDelete())

    act(() => {
      result.current.deleteConnection({ sourceId: 'ind-1', targetId: 'tree-1' })
    })

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
