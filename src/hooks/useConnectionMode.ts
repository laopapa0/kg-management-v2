import { useState, useCallback, useEffect, useRef } from 'react'
import { useAttachmentStore } from '@/stores/attachmentStore'

export interface ConnectionState {
  isConnecting: boolean
  sourceId: string | null
  validTargetIds: Set<string>
  hoverTargetId: string | null
  isContinuous: boolean
  misfireCount: number
}

export function useConnectionMode() {
  const indicators = useAttachmentStore((state) => state.indicators)

  const [state, setState] = useState<ConnectionState>({
    isConnecting: false,
    sourceId: null,
    validTargetIds: new Set(),
    hoverTargetId: null,
    isContinuous: false,
    misfireCount: 0,
  })

  const computeValidTreeTargets = useCallback(
    (sourceId: string): Set<string> => {
      const source = indicators.find((i) => i.id === sourceId)
      const result = new Set<string>()
      for (const indicator of indicators) {
        if (
          indicator.indicatorType === '虚拟分组' &&
          indicator.id !== sourceId &&
          indicator.id !== source?.treeParentId
        ) {
          result.add(indicator.id)
        }
      }
      return result
    },
    [indicators],
  )

  const isContinuousRef = useRef(state.isContinuous)
  isContinuousRef.current = state.isContinuous

  const start = useCallback(
    (sourceId: string) => {
      const source = indicators.find((i) => i.id === sourceId)
      if (!source || source.indicatorType === '虚拟分组') return

      setState({
        isConnecting: true,
        sourceId,
        validTargetIds: computeValidTreeTargets(sourceId),
        hoverTargetId: null,
        isContinuous: isContinuousRef.current,
        misfireCount: 0,
      })
    },
    [computeValidTreeTargets, indicators],
  )

  const cancel = useCallback(() => {
    const sourceIdToFocus = state.sourceId
    setState({
      isConnecting: false,
      sourceId: null,
      validTargetIds: new Set(),
      hoverTargetId: null,
      isContinuous: isContinuousRef.current,
      misfireCount: 0,
    })
    if (sourceIdToFocus) {
      const el = document.querySelector(`[data-indicator-id="${sourceIdToFocus}"]`) as HTMLElement | null
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
      indicators.find((i) => i.id === state.hoverTargetId)?.indicatorType === '虚拟分组'

    if (!isValid) {
      setState((prev) => ({ ...prev, misfireCount: prev.misfireCount + 1 }))
      return false
    }

    const store = useAttachmentStore.getState()
    const nextIndicators = indicators.map((i) => {
      if (i.id !== state.sourceId) return i
      return { ...i, treeParentId: state.hoverTargetId! }
    })
    store.setIndicators(nextIndicators)

    window.dispatchEvent(
      new CustomEvent('connection-confirmed', {
        detail: {
          sourceId: state.sourceId,
          targetId: state.hoverTargetId,
          targetType: 'tree',
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
        isContinuous: isContinuousRef.current,
        misfireCount: 0,
      })
    }
    return true
  }, [state.hoverTargetId, state.validTargetIds, indicators, state.sourceId])

  const setHoverTarget = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, hoverTargetId: id }))
  }, [])

  const toggleContinuous = useCallback(() => {
    setState((prev) => ({ ...prev, isContinuous: !prev.isContinuous }))
  }, [])

  const resetMisfireCount = useCallback(() => {
    setState((prev) => ({ ...prev, misfireCount: 0 }))
  }, [])

  const confirmRef = useRef(confirm)
  confirmRef.current = confirm
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel

  useEffect(() => {
    if (!state.isConnecting) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (e.key === ' ') { e.preventDefault(); confirmRef.current() }
      if (e.key === 'Escape') { e.preventDefault(); cancelRef.current() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [state.isConnecting])

  return { state, start, cancel, confirm, setHoverTarget, toggleContinuous, resetMisfireCount }
}
