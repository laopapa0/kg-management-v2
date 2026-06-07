export interface ConnectionState {
  isConnecting: boolean
  sourceId: string | null
  validTargetIds: Set<string>
  hoverTargetId: string | null
  targetType: 'tree' | 'tag' | 'rule' | null
}

import { useState, useCallback } from 'react'
import { useAttachmentStore } from '@/stores/attachmentStore'

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
  })

  const computeValidTargetIds = useCallback(
    (targetType: 'tree' | 'tag' | 'rule', sourceId: string): Set<string> => {
      const result = new Set<string>()
      if (targetType === 'tree') {
        for (const indicator of indicators) {
          if (indicator.indicatorType === '虚拟分组' && indicator.id !== sourceId) {
            result.add(indicator.id)
          }
        }
      } else if (targetType === 'tag') {
        for (const id of flattenTagNodes(tagNodes)) {
          if (id !== sourceId) result.add(id)
        }
      } else if (targetType === 'rule') {
        for (const id of flattenRules(rules)) {
          if (id !== sourceId) result.add(id)
        }
      }
      return result
    },
    [indicators, tagNodes, rules],
  )

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
      })
    },
    [computeValidTargetIds, indicators],
  )

  const cancel = useCallback(() => {
    setState({
      isConnecting: false,
      sourceId: null,
      validTargetIds: new Set(),
      hoverTargetId: null,
      targetType: null,
    })
  }, [])

  const confirm = useCallback((): boolean => {
    if (!state.hoverTargetId) return false
    if (!state.validTargetIds.has(state.hoverTargetId)) return false

    // 额外校验：tree 类型时目标必须是虚拟分组节点
    if (state.targetType === 'tree') {
      const target = indicators.find((i) => i.id === state.hoverTargetId)
      if (!target || target.indicatorType !== '虚拟分组') return false
    }

    setState({
      isConnecting: false,
      sourceId: null,
      validTargetIds: new Set(),
      hoverTargetId: null,
      targetType: null,
    })
    return true
  }, [state.hoverTargetId, state.validTargetIds, state.targetType, indicators])

  const setHoverTarget = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, hoverTargetId: id }))
  }, [])

  return { state, start, cancel, confirm, setHoverTarget }
}
