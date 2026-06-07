import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore } from '@/stores/attachmentStore'
import { useConnectionMode } from './useConnectionMode'

describe('useConnectionMode', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
  })

  it('returns initial idle state', () => {
    const { result } = renderHook(() => useConnectionMode())

    expect(result.current.state.isConnecting).toBe(false)
    expect(result.current.state.sourceId).toBeNull()
    expect(result.current.state.validTargetIds.size).toBe(0)
    expect(result.current.state.hoverTargetId).toBeNull()
    expect(result.current.state.targetType).toBeNull()
  })

  it('enters connecting state on start', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
    })

    expect(result.current.state.isConnecting).toBe(true)
    expect(result.current.state.sourceId).toBe('ind-real')
    expect(result.current.state.targetType).toBe('tree')
  })

  it('clears state on cancel', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
    })
    expect(result.current.state.isConnecting).toBe(true)

    act(() => {
      result.current.cancel()
    })

    expect(result.current.state.isConnecting).toBe(false)
    expect(result.current.state.sourceId).toBeNull()
    expect(result.current.state.validTargetIds.size).toBe(0)
    expect(result.current.state.hoverTargetId).toBeNull()
    expect(result.current.state.targetType).toBeNull()
  })

  describe('validTargetIds calculation', () => {
    it('tree: includes only virtual grouping nodes as targets', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group-1', name: '分组1', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group-2', name: '分组2', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real', 'tree')
      })

      expect(result.current.state.validTargetIds.has('ind-group-1')).toBe(true)
      expect(result.current.state.validTargetIds.has('ind-group-2')).toBe(true)
      expect(result.current.state.validTargetIds.has('ind-real')).toBe(false)
    })

    it('tag: includes all tag node ids', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
        tagNodes: [
          { id: 'tag-1', name: '标签1' },
          { id: 'tag-2', name: '标签2' },
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real', 'tag')
      })

      expect(result.current.state.validTargetIds.has('tag-1')).toBe(true)
      expect(result.current.state.validTargetIds.has('tag-2')).toBe(true)
    })

    it('rule: includes all rule ids', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
        rules: [
          { id: 'rule-1', name: '规则1', type: 'threshold' },
          { id: 'rule-2', name: '规则2', type: 'fluctuation' },
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real', 'rule')
      })

      expect(result.current.state.validTargetIds.has('rule-1')).toBe(true)
      expect(result.current.state.validTargetIds.has('rule-2')).toBe(true)
    })
  })

  it('setHoverTarget updates hoverTargetId', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
    })

    act(() => {
      result.current.setHoverTarget('ind-group')
    })

    expect(result.current.state.hoverTargetId).toBe('ind-group')

    act(() => {
      result.current.setHoverTarget(null)
    })

    expect(result.current.state.hoverTargetId).toBeNull()
  })

  it('confirm returns true and exits connecting when hoverTarget is valid', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
      result.current.setHoverTarget('ind-group')
    })

    let confirmed = false
    act(() => {
      confirmed = result.current.confirm()
    })

    expect(confirmed).toBe(true)
    expect(result.current.state.isConnecting).toBe(false)
  })

  it('confirm returns false when hoverTarget is not in validTargetIds', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
      result.current.setHoverTarget('invalid-target')
    })

    let confirmed = false
    act(() => {
      confirmed = result.current.confirm()
    })

    expect(confirmed).toBe(false)
    expect(result.current.state.isConnecting).toBe(true)
  })

  it('confirm returns false when hoverTargetId is null', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
    })

    let confirmed = false
    act(() => {
      confirmed = result.current.confirm()
    })

    expect(confirmed).toBe(false)
    expect(result.current.state.isConnecting).toBe(true)
  })

  it('does not start when sourceId is a virtual grouping node', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-group', 'tree')
    })

    expect(result.current.state.isConnecting).toBe(false)
    expect(result.current.state.sourceId).toBeNull()
  })

  it('confirm rejects tree target that is not a virtual grouping node', () => {
    useAttachmentStore.setState({
      indicators: [
        { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        { id: 'ind-real-2', name: '真实指标2', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
      ],
    })

    const { result } = renderHook(() => useConnectionMode())

    act(() => {
      result.current.start('ind-real', 'tree')
      result.current.setHoverTarget('ind-real-2')
    })

    let confirmed = false
    act(() => {
      confirmed = result.current.confirm()
    })

    expect(confirmed).toBe(false)
    expect(result.current.state.isConnecting).toBe(true)
  })
})
