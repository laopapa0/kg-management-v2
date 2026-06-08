import { useState, useCallback, useEffect, useRef } from 'react'
import { useAttachmentStore } from '@/stores/attachmentStore'

export interface ConnectionState {
  isConnecting: boolean
  sourceId: string | null
  validTargetIds: Set<string>
  hoverTargetId: string | null
  targetType: 'tree' | 'tag' | 'rule' | null
  isContinuous: boolean
  misfireCount: number
}

function collectAllIds<T extends { id: string; children?: T[] }>(nodes: T[]): string[] {
  const result: string[] = []
  for (const node of nodes) {
    result.push(node.id)
    if (node.children) {
      result.push(...collectAllIds(node.children))
    }
  }
  return result
}

function flattenTagNodes(tagNodes: { id: string; children?: { id: string }[] }[]): string[] {
  return collectAllIds(tagNodes)
}

function flattenRules(rules: { id: string; children?: { id: string }[] }[]): string[] {
  return collectAllIds(rules)
}

export function useConnectionMode() {
  const indicators = useAttachmentStore((state) => state.indicators)
  const tagNodes = useAttachmentStore((state) => state.tagNodes)
  const rules = useAttachmentStore((state) => state.rules)

  const [state, setState] = useState<ConnectionState>({
    isConnecting: false,
    sourceId: null,
    validTargetIds: new Set(),
    hoverTargetId: null,
    targetType: null,
    isContinuous: false,
    misfireCount: 0,
  })

  const computeValidTargetIds = useCallback(
    (targetType: 'tree' | 'tag' | 'rule', sourceId: string): Set<string> => {
      const source = indicators.find((i) => i.id === sourceId)
      const result = new Set<string>()
      if (targetType === 'tree') {
        for (const indicator of indicators) {
          if (
            indicator.indicatorType === '虚拟分组' &&
            indicator.id !== sourceId &&
            indicator.id !== source?.treeParentId
          ) {
            result.add(indicator.id)
          }
        }
      } else if (targetType === 'tag') {
        const attachedTagIds = new Set(source?.tagIds ?? [])
        for (const id of flattenTagNodes(tagNodes)) {
          if (id !== sourceId && !attachedTagIds.has(id)) result.add(id)
        }
      } else if (targetType === 'rule') {
        const attachedRuleIds = new Set(source?.ruleIds ?? [])
        for (const id of flattenRules(rules)) {
          if (id !== sourceId && !attachedRuleIds.has(id)) result.add(id)
        }
      }
      return result
    },
    [indicators, tagNodes, rules],
  )

  // Use ref to avoid including state.isContinuous in useCallback deps
  const isContinuousRef = useRef(state.isContinuous)
  isContinuousRef.current = state.isContinuous

  const start = useCallback(
    (sourceId: string, targetType: 'tree' | 'tag' | 'rule') => {
      // sourceId 必须是真实指标，不能是虚拟分组节点
      const source = indicators.find((i) => i.id === sourceId)
      if (!source || source.indicatorType === '虚拟分组') return

      setState({
        isConnecting: true,
        sourceId,
        targetType,
        validTargetIds: computeValidTargetIds(targetType, sourceId),
        hoverTargetId: null,
        isContinuous: isContinuousRef.current,
        misfireCount: 0,
      })
    },
    [computeValidTargetIds, indicators],
  )

  const cancel = useCallback(() => {
    const sourceIdToFocus = state.sourceId
    setState({
      isConnecting: false,
      sourceId: null,
      validTargetIds: new Set(),
      hoverTargetId: null,
      targetType: null,
      isContinuous: isContinuousRef.current,
      misfireCount: 0,
    })
    // 焦点返还源指标元素，若不在 DOM 中则 fallback 到 body
    if (sourceIdToFocus) {
      const el = document.getElementById(sourceIdToFocus)
      if (el && typeof el.focus === 'function') {
        el.focus()
      } else {
        document.body.focus()
      }
    }
  }, [state.sourceId])

  const confirm = useCallback((): boolean => {
    const isValid =
      state.hoverTargetId !== null &&
      state.validTargetIds.has(state.hoverTargetId) &&
      !(state.targetType === 'tree' &&
        indicators.find((i) => i.id === state.hoverTargetId)?.indicatorType !== '虚拟分组')

    if (!isValid) {
      setState((prev) => ({ ...prev, misfireCount: prev.misfireCount + 1 }))
      return false
    }

    // 数据更新 + 历史快照
    const store = useAttachmentStore.getState()
    const nextIndicators = indicators.map((i) => {
      if (i.id !== state.sourceId) return i
      if (state.targetType === 'tree') {
        return { ...i, treeParentId: state.hoverTargetId! }
      } else if (state.targetType === 'tag') {
        return { ...i, tagIds: [...i.tagIds, state.hoverTargetId!] }
      } else if (state.targetType === 'rule') {
        return { ...i, ruleIds: [...i.ruleIds, state.hoverTargetId!] }
      }
      return i
    })
    store.setIndicators(nextIndicators)

    // 触发 fly-out 动画
    window.dispatchEvent(
      new CustomEvent('connection-confirmed', {
        detail: {
          sourceId: state.sourceId,
          targetId: state.hoverTargetId,
          targetType: state.targetType,
        },
      }),
    )

    if (isContinuousRef.current) {
      setState((prev) => ({ ...prev, hoverTargetId: null, misfireCount: 0 }))
    } else {
      setState({
        isConnecting: false,
        sourceId: null,
        validTargetIds: new Set(),
        hoverTargetId: null,
        targetType: null,
        isContinuous: isContinuousRef.current,
        misfireCount: 0,
      })
    }
    return true
  }, [state.hoverTargetId, state.validTargetIds, state.targetType, indicators, state.sourceId])

  const setHoverTarget = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, hoverTargetId: id }))
  }, [])

  const toggleContinuous = useCallback(() => {
    setState((prev) => ({ ...prev, isContinuous: !prev.isContinuous }))
  }, [])

  const resetMisfireCount = useCallback(() => {
    setState((prev) => ({ ...prev, misfireCount: 0 }))
  }, [])

  // Keyboard event handling (Space / ESC)
  const confirmRef = useRef(confirm)
  confirmRef.current = confirm
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel

  useEffect(() => {
    if (!state.isConnecting) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        confirmRef.current()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelRef.current()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [state.isConnecting])

  return { state, start, cancel, confirm, setHoverTarget, toggleContinuous, resetMisfireCount }
}
