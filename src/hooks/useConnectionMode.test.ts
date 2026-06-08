import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, fireEvent } from '@testing-library/react'
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
    expect(result.current.state.isContinuous).toBe(false)
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
      result.current.start('ind-real')
    })

    expect(result.current.state.isConnecting).toBe(true)
    expect(result.current.state.sourceId).toBe('ind-real')
    expect(result.current.state.validTargetIds.size).toBeGreaterThan(0)
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
      result.current.start('ind-real')
    })
    expect(result.current.state.isConnecting).toBe(true)

    act(() => {
      result.current.cancel()
    })

    expect(result.current.state.isConnecting).toBe(false)
    expect(result.current.state.sourceId).toBeNull()
    expect(result.current.state.validTargetIds.size).toBe(0)
    expect(result.current.state.hoverTargetId).toBeNull()
    expect(result.current.state.isContinuous).toBe(false)
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
        result.current.start('ind-real')
      })

      expect(result.current.state.validTargetIds.has('ind-group-1')).toBe(true)
      expect(result.current.state.validTargetIds.has('ind-group-2')).toBe(true)
      expect(result.current.state.validTargetIds.has('ind-real')).toBe(false)
    })

    it.skip('tag: includes all tag node ids', () => {
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
        result.current.start('ind-real')
      })

      expect(result.current.state.validTargetIds.has('tag-1')).toBe(true)
      expect(result.current.state.validTargetIds.has('tag-2')).toBe(true)
    })

    it.skip('rule: includes all rule ids', () => {
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
      result.current.start('ind-real')
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
      result.current.start('ind-real')
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
      result.current.start('ind-real')
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
      result.current.start('ind-real')
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
        result.current.start('ind-group')
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
      result.current.start('ind-real')
      result.current.setHoverTarget('ind-real-2')
    })

    let confirmed = false
    act(() => {
      confirmed = result.current.confirm()
    })

    expect(confirmed).toBe(false)
    expect(result.current.state.isConnecting).toBe(true)
  })

  describe('keyboard events', () => {
    it('Space key confirms attachment when hovering valid target', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
      })

      act(() => {
        fireEvent.keyDown(document, { key: ' ' })
      })

      expect(result.current.state.isConnecting).toBe(false)
      expect(result.current.state.sourceId).toBeNull()
    })

    it('ESC key cancels and returns focus to source element', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      // 创建源指标 DOM 元素
      const sourceEl = document.createElement('div')
      sourceEl.id = 'ind-real'
      sourceEl.setAttribute('data-indicator-id', 'ind-real')
      sourceEl.tabIndex = 0
      document.body.appendChild(sourceEl)

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })

      expect(result.current.state.isConnecting).toBe(false)
      expect(document.activeElement).toBe(sourceEl)

      document.body.removeChild(sourceEl)
    })

    it('ESC fallback focuses body when source element is not in DOM', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })

      expect(result.current.state.isConnecting).toBe(false)
      expect(document.activeElement).toBe(document.body)
    })

    it('ignores Space/ESC when an input element is focused', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
      })

      act(() => {
        fireEvent.keyDown(input, { key: ' ' })
      })
      expect(result.current.state.isConnecting).toBe(true)

      act(() => {
        fireEvent.keyDown(input, { key: 'Escape' })
      })
      expect(result.current.state.isConnecting).toBe(true)

      document.body.removeChild(input)
    })

    it('ignores Space/ESC when a textarea is focused', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        fireEvent.keyDown(textarea, { key: 'Escape' })
      })
      expect(result.current.state.isConnecting).toBe(true)

      document.body.removeChild(textarea)
    })

    it('ignores Space/ESC when a contenteditable element is focused', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const editable = document.createElement('div')
      editable.contentEditable = 'true'
      document.body.appendChild(editable)
      editable.focus()

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        fireEvent.keyDown(editable, { key: ' ' })
      })
      expect(result.current.state.isConnecting).toBe(true)

      document.body.removeChild(editable)
    })
  })

  describe('continuous mode', () => {
    it('isContinuous is false by default', () => {
      const { result } = renderHook(() => useConnectionMode())
      expect(result.current.state.isContinuous).toBe(false)
    })

    it('toggleContinuous flips the flag', () => {
      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.toggleContinuous()
      })
      expect(result.current.state.isContinuous).toBe(true)

      act(() => {
        result.current.toggleContinuous()
      })
      expect(result.current.state.isContinuous).toBe(false)
    })

    it('confirm exits connecting when isContinuous is false', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
      })

      let confirmed = false
      act(() => {
        confirmed = result.current.confirm()
      })

      expect(confirmed).toBe(true)
      expect(result.current.state.isConnecting).toBe(false)
    })

    it('confirm keeps connecting when isContinuous is true', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
        result.current.toggleContinuous()
      })

      let confirmed = false
      act(() => {
        confirmed = result.current.confirm()
      })

      expect(confirmed).toBe(true)
      expect(result.current.state.isConnecting).toBe(true)
      expect(result.current.state.sourceId).toBe('ind-real')
      expect(result.current.state.hoverTargetId).toBeNull()
    })
  })

  describe('misfire counter', () => {
    it('misfireCount is 0 by default', () => {
      const { result } = renderHook(() => useConnectionMode())
      expect(result.current.state.misfireCount).toBe(0)
    })

    it('increments misfireCount on invalid confirm', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        result.current.confirm()
      })
      expect(result.current.state.misfireCount).toBe(1)

      act(() => {
        result.current.confirm()
      })
      expect(result.current.state.misfireCount).toBe(2)
    })

    it('resets misfireCount on successful confirm', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      // 先触发一次无效 confirm
      act(() => {
        result.current.confirm()
      })
      expect(result.current.state.misfireCount).toBe(1)

      // 设置有效目标
      act(() => {
        result.current.setHoverTarget('ind-group')
      })
      // 确认
      act(() => {
        result.current.confirm()
      })

      expect(result.current.state.misfireCount).toBe(0)
    })

    it('resets misfireCount on cancel', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })
      act(() => {
        result.current.confirm()
      })
      expect(result.current.state.misfireCount).toBe(1)

      act(() => {
        result.current.cancel()
      })
      expect(result.current.state.misfireCount).toBe(0)
    })

    it('resets misfireCount on start', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })
      act(() => {
        result.current.confirm()
      })
      expect(result.current.state.misfireCount).toBe(1)

      act(() => {
        result.current.cancel()
      })

      act(() => {
        result.current.start('ind-real')
      })
      expect(result.current.state.misfireCount).toBe(0)
    })

    it('increments misfireCount via Space key on invalid target', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        fireEvent.keyDown(document, { key: ' ' })
      })

      expect(result.current.state.misfireCount).toBe(1)
    })

    it('resetMisfireCount resets counter to 0', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })
      act(() => {
        result.current.confirm()
      })
      expect(result.current.state.misfireCount).toBe(1)

      act(() => {
        result.current.resetMisfireCount()
      })
      expect(result.current.state.misfireCount).toBe(0)
    })
  })

  describe('filter already-attached targets', () => {
    it('tree: excludes the virtual group that source is already attached to', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: 'ind-group-1' } as any,
          { id: 'ind-group-1', name: '分组1', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group-2', name: '分组2', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      expect(result.current.state.validTargetIds.has('ind-group-1')).toBe(false)
      expect(result.current.state.validTargetIds.has('ind-group-2')).toBe(true)
    })

    it.skip('tag: excludes tags already in source.tagIds', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: ['tag-1'], ruleIds: [], treeParentId: undefined } as any,
        ],
        tagNodes: [
          { id: 'tag-1', name: '标签1' },
          { id: 'tag-2', name: '标签2' },
        ],
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      expect(result.current.state.validTargetIds.has('tag-1')).toBe(false)
      expect(result.current.state.validTargetIds.has('tag-2')).toBe(true)
    })

    it.skip('rule: excludes rules already in source.ruleIds', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: ['rule-1'], treeParentId: undefined } as any,
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

      expect(result.current.state.validTargetIds.has('rule-1')).toBe(false)
      expect(result.current.state.validTargetIds.has('rule-2')).toBe(true)
    })
  })

  describe('data update on confirm', () => {
    it('updates treeParentId when targetType is tree', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
        undoStack: [],
        canUndo: false,
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
      })

      act(() => {
        result.current.confirm()
      })

      const updated = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-real')
      expect(updated?.treeParentId).toBe('ind-group')
    })

    it.skip('adds targetId to tagIds when targetType is tag', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
        tagNodes: [{ id: 'tag-1', name: '标签1' }],
        undoStack: [],
        canUndo: false,
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('tag-1')
      })

      act(() => {
        result.current.confirm()
      })

      const updated = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-real')
      expect(updated?.tagIds).toContain('tag-1')
    })

    it.skip('adds targetId to ruleIds when targetType is rule', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
        rules: [{ id: 'rule-1', name: '规则1', type: 'threshold' }],
        undoStack: [],
        canUndo: false,
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real', 'rule')
        result.current.setHoverTarget('rule-1')
      })

      act(() => {
        result.current.confirm()
      })

      const updated = useAttachmentStore.getState().indicators.find((i) => i.id === 'ind-real')
      expect(updated?.ruleIds).toContain('rule-1')
    })

    it('pushes history snapshot on confirm', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
        undoStack: [],
        canUndo: false,
      })

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
      })

      act(() => {
        result.current.confirm()
      })

      expect(useAttachmentStore.getState().canUndo).toBe(true)
      expect(useAttachmentStore.getState().undoStack.length).toBeGreaterThan(0)
    })

    it('dispatches connection-confirmed event on success', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
          { id: 'ind-group', name: '分组节点', indicatorType: '虚拟分组', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const eventSpy = vi.fn()
      window.addEventListener('connection-confirmed', eventSpy)

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
        result.current.setHoverTarget('ind-group')
      })

      act(() => {
        result.current.confirm()
      })

      expect(eventSpy).toHaveBeenCalled()
      const detail = (eventSpy.mock.calls[0][0] as CustomEvent).detail
      expect(detail.sourceId).toBe('ind-real')
      expect(detail.targetId).toBe('ind-group')
      expect(detail.targetType).toBe('tree')

      window.removeEventListener('connection-confirmed', eventSpy)
    })

    it('does not dispatch event on invalid confirm', () => {
      useAttachmentStore.setState({
        indicators: [
          { id: 'ind-real', name: '真实指标', indicatorType: '原子指标', tagIds: [], ruleIds: [], treeParentId: undefined } as any,
        ],
      })

      const eventSpy = vi.fn()
      window.addEventListener('connection-confirmed', eventSpy)

      const { result } = renderHook(() => useConnectionMode())

      act(() => {
        result.current.start('ind-real')
      })

      act(() => {
        result.current.confirm()
      })

      expect(eventSpy).not.toHaveBeenCalled()

      window.removeEventListener('connection-confirmed', eventSpy)
    })
  })
})
