import { useState, useCallback, useRef, useEffect } from 'react'
import { useAttachmentStore } from '@/stores/attachmentStore'

export interface DeletedConnection {
  sourceId: string
  targetId: string
  previousTreeParentId?: string
  previousTagIds: string[]
  previousRuleIds: string[]
}

const UNDO_TIMEOUT = 5000

export function useConnectionDelete() {
  const [lastDeleted, setLastDeleted] = useState<DeletedConnection | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const deleteConnection = useCallback(
    (connection: { sourceId: string; targetId: string }) => {
      const store = useAttachmentStore.getState()
      const indicator = store.indicators.find((i) => i.id === connection.sourceId)
      if (!indicator) return

      let type: 'tree' | 'tag' | 'rule' | null = null

      if (indicator.treeParentId === connection.targetId) {
        type = 'tree'
      } else if (indicator.tagIds.includes(connection.targetId)) {
        type = 'tag'
      } else if (indicator.ruleIds.includes(connection.targetId)) {
        type = 'rule'
      }

      if (!type) return

      clearTimer()

      const previousTreeParentId = indicator.treeParentId
      const previousTagIds = [...indicator.tagIds]
      const previousRuleIds = [...indicator.ruleIds]

      const nextIndicators = store.indicators.map((i) => {
        if (i.id !== connection.sourceId) return i
        if (type === 'tree') {
          return { ...i, treeParentId: undefined }
        }
        if (type === 'tag') {
          return { ...i, tagIds: i.tagIds.filter((id) => id !== connection.targetId) }
        }
        if (type === 'rule') {
          return { ...i, ruleIds: i.ruleIds.filter((id) => id !== connection.targetId) }
        }
        return i
      })

      store.setIndicators(nextIndicators)

      setLastDeleted({
        sourceId: connection.sourceId,
        targetId: connection.targetId,
        previousTreeParentId,
        previousTagIds,
        previousRuleIds,
      })

      timerRef.current = setTimeout(() => {
        setLastDeleted(null)
      }, UNDO_TIMEOUT)
    },
    [],
  )

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return

    const store = useAttachmentStore.getState()

    const nextIndicators = store.indicators.map((i) => {
      if (i.id !== lastDeleted.sourceId) return i
      return {
        ...i,
        treeParentId: lastDeleted.previousTreeParentId,
        tagIds: lastDeleted.previousTagIds,
        ruleIds: lastDeleted.previousRuleIds,
      }
    })

    store.setIndicators(nextIndicators)
    setLastDeleted(null)
    clearTimer()
  }, [lastDeleted])

  // Cleanup timer on unmount to avoid memory leaks
  useEffect(() => {
    return () => clearTimer()
  }, [])

  return { lastDeleted, deleteConnection, undoDelete }
}
