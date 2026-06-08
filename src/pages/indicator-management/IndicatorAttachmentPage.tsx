import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Group, Panel, Separator } from 'react-resizable-panels'
import PanelHeader from '@/components/panel/PanelHeader'
import IndicatorGrid from '@/components/indicator/IndicatorGrid'
import IndicatorTreePanel, { type IndicatorTreePanelRef } from './IndicatorTreePanel'
import TagSetPanel from './TagSetPanel'
import RulePanel from './RulePanel'
import SourceAnchorMarker from '@/components/connection/SourceAnchorMarker'
import ConnectionLayer from '@/components/connection/ConnectionLayer'
import PersistentConnectionLayer from '@/components/connection/PersistentConnectionLayer'
import PulseRing from '@/components/connection/PulseRing'
import MiniToast from '@/components/connection/MiniToast'
import FocusModeOverlay from '@/components/connection/FocusModeOverlay'
import AttachmentCommandPalette from '@/components/command/AttachmentCommandPalette'
import { Switch } from '@/components/ui/switch'
import { useConnectionMode } from '@/hooks/useConnectionMode'
import { useFocusZone } from '@/hooks/useFocusZone'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useTargetBounce } from '@/hooks/useTargetBounce'
import { useConnectionDelete } from '@/hooks/useConnectionDelete'
import { initializeAttachmentStore, selectPendingIndicators, useAttachmentStore } from '@/stores/attachmentStore'

const PANEL_MIN_WIDTH_LEFT = 240
const PANEL_MIN_WIDTH_CENTER = 400
const PANEL_MIN_WIDTH_RIGHT = 240

function getFocusZoneHint(zone: ReturnType<typeof useFocusZone>): string | null {
  switch (zone) {
    case 'indicator':
      return '按 Space 进入连线模式'
    case 'tag':
      return '按 Space 切换标签选中'
    case 'tree':
      return '按 Space 选中节点'
    case 'rule':
      return '按 Space 关联规则'
    default:
      return null
  }
}

export default function IndicatorAttachmentPage() {
  const treePanelRef = useRef<IndicatorTreePanelRef>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const rightColumnRef = useRef<HTMLDivElement>(null)
  const { state, start, setHoverTarget, confirm, cancel, toggleContinuous, resetMisfireCount } = useConnectionMode()
  const focusZone = useFocusZone()
  const focusZoneHint = useMemo(() => getFocusZoneHint(focusZone), [focusZone])

  // Command palette state
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null)
  const [paletteToastTargetId, setPaletteToastTargetId] = useState<string | null>(null)
  const [gridSearchQuery, setGridSearchQuery] = useState('')

  // Focus traps for connection mode and config mode
  useFocusTrap(pageRef, { enabled: state.isConnecting })
  useFocusTrap(rightColumnRef, { enabled: selectedIndicatorId !== null && !state.isConnecting })

  // Connection delete + undo
  const { lastDeleted, deleteConnection, undoDelete } = useConnectionDelete()

  // Feedback state for successful attachment
  const [pulseTargetId, setPulseTargetId] = useState<string | null>(null)
  const [toastTargetId, setToastTargetId] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useTargetBounce()

  // Listen for connection-confirmed to trigger feedback
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { targetId: string }
      setPulseTargetId(detail.targetId)
      // Delay toast until pulse ring dissipates (400ms)
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
      toastTimerRef.current = setTimeout(() => setToastTargetId(detail.targetId), 400)
    }
    window.addEventListener('connection-confirmed', handler)
    return () => {
      window.removeEventListener('connection-confirmed', handler)
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
        toastTimerRef.current = null
      }
    }
  }, [])

  // Auto-clear pulse after 450ms
  useEffect(() => {
    if (!pulseTargetId) return
    const timer = setTimeout(() => setPulseTargetId(null), 450)
    return () => clearTimeout(timer)
  }, [pulseTargetId])

  // Auto-clear toast after 2s
  useEffect(() => {
    if (!toastTargetId) return
    const timer = setTimeout(() => setToastTargetId(null), 2000)
    return () => clearTimeout(timer)
  }, [toastTargetId])

  useEffect(() => {
    initializeAttachmentStore()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Block global shortcuts during inline editing
      const target = event.target as HTMLElement
      if (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return
      }
      useAttachmentStore.getState().handleKeyDown(event)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Cmd/Ctrl+K opens command palette
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-clear palette toast after 2s
  useEffect(() => {
    if (!paletteToastTargetId) return
    const timer = setTimeout(() => setPaletteToastTargetId(null), 2000)
    return () => clearTimeout(timer)
  }, [paletteToastTargetId])

  // Click-on-valid-target confirms attachment (no Space needed)
  const confirmRef = useRef(confirm)
  confirmRef.current = confirm
  const cancelRef = useRef(cancel)
  cancelRef.current = cancel

  useEffect(() => {
    if (!state.isConnecting) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const nodeEl = target.closest('[data-node-id]')
      if (nodeEl) {
        const nodeId = nodeEl.getAttribute('data-node-id')
        if (nodeId && state.validTargetIds.has(nodeId)) {
          e.preventDefault()
          e.stopPropagation()
          confirmRef.current()
        }
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      cancelRef.current()
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('contextmenu', handleContextMenu, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
    }
  }, [state.isConnecting, state.validTargetIds, setHoverTarget])

  // Body cursor follows connection mode
  useEffect(() => {
    if (state.isConnecting) {
      document.body.style.cursor = 'crosshair'
    } else {
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.cursor = ''
    }
  }, [state.isConnecting])

  // Shake status bar on misfire (DOM class toggle, avoids remount)
  const statusBarRef = useRef<HTMLDivElement>(null)
  const prevMisfireRef = useRef(0)
  useEffect(() => {
    if (state.misfireCount > prevMisfireRef.current && statusBarRef.current) {
      statusBarRef.current.classList.remove('animate-shake-connection')
      // force reflow to restart animation
      void statusBarRef.current.offsetWidth
      statusBarRef.current.classList.add('animate-shake-connection')
    }
    prevMisfireRef.current = state.misfireCount
  }, [state.misfireCount])

  // Misfire hint: show after 3 misfires, auto-dismiss after 3s
  const [showHint, setShowHint] = useState(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (state.misfireCount >= 3 && !showHint) {
      setShowHint(true)
    }
    if (!state.isConnecting && showHint) {
      setShowHint(false)
    }
  }, [state.misfireCount, state.isConnecting, showHint])

  useEffect(() => {
    if (showHint && dismissTimerRef.current === null) {
      dismissTimerRef.current = setTimeout(() => {
        setShowHint(false)
        resetMisfireCount()
        dismissTimerRef.current = null
      }, 3000)
    }
    if (!showHint && dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }, [showHint, resetMisfireCount])

  // Cleanup timer on unmount only
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
      }
    }
  }, [])

  // Global hover target detection in connection mode
  useEffect(() => {
    if (!state.isConnecting) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      let hoveredId: string | null = null

      const nodeEl = target.closest('[data-node-id]')
      if (nodeEl) hoveredId = nodeEl.getAttribute('data-node-id')

      const tagEl = target.closest('[data-tag-id]')
      if (tagEl) hoveredId = tagEl.getAttribute('data-tag-id')

      const ruleEl = target.closest('[data-rule-id]')
      if (ruleEl) hoveredId = ruleEl.getAttribute('data-rule-id')

      if (hoveredId) {
        setHoverTarget(hoveredId)
      } else {
        setHoverTarget(null)
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    return () => document.removeEventListener('mouseover', handleMouseOver)
  }, [state.isConnecting, setHoverTarget])

  // Global Space dispatcher in non-connecting mode (capture phase)
  useEffect(() => {
    if (state.isConnecting) return

    const handler = (e: KeyboardEvent) => {
      if (e.key !== ' ') return
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Find the closest data-focus-zone ancestor
      let el: Element | null = target
      let zone: string | null = null
      while (el) {
        const z = el.getAttribute('data-focus-zone')
        if (z === 'indicator' || z === 'tag' || z === 'tree' || z === 'rule') {
          zone = z
          break
        }
        el = el.parentElement
      }

      if (zone === 'indicator') {
        const card = target.closest('[data-indicator-id]') as HTMLElement | null
        if (card) {
          e.preventDefault()
          e.stopPropagation()
          start(card.dataset.indicatorId!)
        }
      } else if (zone === 'tag') {
        const pill = target.closest('button[data-tag-id]') as HTMLButtonElement | null
        if (pill) {
          e.preventDefault()
          e.stopPropagation()
          pill.click()
        }
      }
    }

    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [state.isConnecting, start])

  const allIndicators = useAttachmentStore(useShallow((s) => s.indicators))
  const pendingIndicators = useAttachmentStore(useShallow(selectPendingIndicators))
  const setIndicators = useAttachmentStore((s) => s.setIndicators)

  const persistentConnections = useMemo(() => {
    const result: { sourceId: string; targetId: string }[] = []
    for (const ind of allIndicators) {
      if (ind.treeParentId) {
        result.push({ sourceId: ind.id, targetId: ind.treeParentId })
      }
      for (const tagId of ind.tagIds) {
        result.push({ sourceId: ind.id, targetId: tagId })
      }
      for (const ruleId of ind.ruleIds) {
        result.push({ sourceId: ind.id, targetId: ruleId })
      }
    }
    return result
  }, [allIndicators])

  const handleSelectIndicator = useCallback(
    (indicatorId: string) => {
      const indicator = allIndicators.find((i) => i.id === indicatorId)
      if (!indicator) return
      setSelectedIndicatorId(indicatorId)
      if (
        !indicator.treeParentId &&
        indicator.tagIds.length === 0 &&
        indicator.ruleIds.length === 0
      ) {
        // In pending area: scroll to card and highlight
        const el = document.querySelector(`[data-indicator-id="${indicatorId}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (indicator.treeParentId) {
        // In tree: expand ancestors and select
        treePanelRef.current?.expandAndSelectNode(indicatorId)
      }
    },
    [allIndicators],
  )

  const handleToggleTag = useCallback(
    (tagId: string) => {
      if (!selectedIndicatorId) return
      setIndicators(
        allIndicators.map((i) => {
          if (i.id !== selectedIndicatorId) return i
          const hasTag = i.tagIds.includes(tagId)
          return {
            ...i,
            tagIds: hasTag ? i.tagIds.filter((id) => id !== tagId) : [...i.tagIds, tagId],
          }
        }),
      )
      setPaletteToastTargetId(selectedIndicatorId)
    },
    [selectedIndicatorId, allIndicators, setIndicators],
  )

  const handleToggleRule = useCallback(
    (ruleId: string) => {
      if (!selectedIndicatorId) return
      setIndicators(
        allIndicators.map((i) => {
          if (i.id !== selectedIndicatorId) return i
          const hasRule = i.ruleIds.includes(ruleId)
          return {
            ...i,
            ruleIds: hasRule ? i.ruleIds.filter((id) => id !== ruleId) : [...i.ruleIds, ruleId],
          }
        }),
      )
      setPaletteToastTargetId(selectedIndicatorId)
    },
    [selectedIndicatorId, allIndicators, setIndicators],
  )

  const indicatorsWithClick = pendingIndicators.map((ind) => ({
    ...ind,
    onClick: () => {
      setSelectedIndicatorId(ind.id)
      start(ind.id)
    },
  }))

  return (
    <div
      ref={pageRef}
      data-testid="indicator-attachment-page"
      data-dim-mode={state.isConnecting ? 'true' : undefined}
      className="relative h-full w-full bg-dark-page p-3 text-dark-text-primary"
    >
      {/* Connection mode status bar */}
      {state.isConnecting && (
        <div
          ref={statusBarRef}
          data-testid="connection-status-bar"
          className="absolute left-0 right-0 top-0 z-40 flex items-center justify-center gap-2 bg-dark-accent-primary/90 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          <span>连线模式</span>
          <span className="text-white/70">— 点击目录挂靠，右键/ESC 取消</span>
        </div>
      )}

      {/* Misfire hint */}
      {showHint && (
        <div
          data-testid="misfire-hint"
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-dark-border/80 px-4 py-2 text-xs text-dark-text-secondary backdrop-blur-sm"
        >
           点击目录节点即可挂靠，右键取消
        </div>
      )}

      <Group orientation="horizontal" className="h-full gap-2">
        <Panel
          id="indicator-tree"
          defaultSize={25}
          minSize={15}
          style={{ minWidth: PANEL_MIN_WIDTH_LEFT }}
          className="min-h-0"
        >
          <div
            data-testid="panel-indicator-tree"
            data-focus-zone="tree"
            className="flex h-full flex-col rounded-lg border border-dark-border bg-dark-card-l1"
          >
            <PanelHeader
              title="指标树"
              onAdd={() => {
                treePanelRef.current?.openAddDialog()
              }}
            />
            <IndicatorTreePanel ref={treePanelRef} />
          </div>
        </Panel>

        <Separator className="w-1 bg-transparent transition-colors hover:bg-dark-accent-primary" />

        <Panel
          id="pending-indicators"
          defaultSize={50}
          minSize={30}
          style={{ minWidth: PANEL_MIN_WIDTH_CENTER }}
          className="min-h-0"
        >
          <div
            data-testid="panel-pending-indicators"
            data-focus-zone="indicator"
            className="flex h-full flex-col rounded-lg border border-dark-border bg-dark-elevated"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <PanelHeader
                title="待选指标"
                onAdd={() => {
                  // TODO: #20 指标添加节点
                }}
              />
              <div className="flex items-center gap-2">
                {indicatorsWithClick.length > 500 && (
                  <input
                    type="text"
                    placeholder="搜索指标..."
                    value={gridSearchQuery}
                    onChange={(e) => setGridSearchQuery(e.target.value)}
                    className="h-7 rounded-md border border-dark-border bg-dark-input-bg px-2 text-xs text-dark-text-primary placeholder:text-dark-text-tertiary outline-none focus:ring-1 focus:ring-dark-focus-ring"
                    data-testid="grid-search-input"
                  />
                )}
                <span className="text-xs text-dark-text-secondary">连续挂靠</span>
                <Switch
                  checked={state.isContinuous}
                  onCheckedChange={toggleContinuous}
                  aria-label="连续挂靠"
                />
              </div>
            </div>
            <IndicatorGrid
              indicators={indicatorsWithClick}
              searchQuery={gridSearchQuery}
            />
          </div>
        </Panel>

        <Separator className="w-1 bg-transparent transition-colors hover:bg-dark-accent-primary" />

        <Panel
          id="right-column"
          defaultSize={25}
          minSize={15}
          style={{ minWidth: PANEL_MIN_WIDTH_RIGHT }}
          className="min-h-0"
        >
          <div ref={rightColumnRef} className="h-full">
            <Group orientation="vertical" className="h-full gap-2">
            <Panel id="tag-set" defaultSize={50} minSize={10} className="min-h-0">
              <div
                data-testid="panel-tag-set"
                data-focus-zone="tag"
                className="flex h-full flex-col rounded-lg border border-dark-border bg-dark-card-l1"
              >
                <PanelHeader
                  title="标签集"
                  onAdd={() => {
                    // TODO: #25 标签集添加节点
                  }}
                />
                <TagSetPanel selectedIndicatorId={selectedIndicatorId} />
              </div>
            </Panel>

            <Separator className="h-1 bg-transparent transition-colors hover:bg-dark-accent-primary" />

            <Panel id="rules" defaultSize={50} minSize={10} className="min-h-0">
              <div
                data-testid="panel-rules"
                data-focus-zone="rule"
                className="flex h-full flex-col rounded-lg border border-dark-border bg-dark-card-l1"
              >
                <PanelHeader title="规则" />
                <RulePanel selectedIndicatorId={selectedIndicatorId} />
              </div>
            </Panel>
          </Group>
          </div>
        </Panel>
      </Group>

      {/* Focus zone hint (only shown in non-connecting mode) */}
      {!state.isConnecting && focusZoneHint && (
        <div
          data-testid="focus-zone-hint"
          className="absolute bottom-4 right-4 z-50 rounded-md bg-dark-card-l2/90 px-3 py-1.5 text-xs text-dark-text-secondary backdrop-blur-sm border border-dark-border"
        >
          {focusZoneHint}
        </div>
      )}

      {/* Spotlight focus mask */}
      <FocusModeOverlay
        isVisible={state.isConnecting}
        sourceId={state.sourceId}
        validTargetIds={state.validTargetIds}
        targetType="tree"
      />

      {/* Persistent solid connection lines */}
      <PersistentConnectionLayer
        connections={persistentConnections}
        onDelete={deleteConnection}
        requiresConfirm={(conn) => {
          const indicator = allIndicators.find((i) => i.id === conn.sourceId)
          return indicator?.ruleIds.includes(conn.targetId) ?? false
        }}
      />

      {/* SVG connection layer (active dashed line during connection mode) */}
      {state.isConnecting && state.sourceId && (
        <ConnectionLayer
          sourceId={state.sourceId}
          hoverTargetId={state.hoverTargetId}
          validTargetIds={state.validTargetIds}
        />
      )}

      {/* Source anchor marker when source scrolls out of viewport */}
      {state.isConnecting && state.sourceId && (
        <SourceAnchorMarker
          sourceId={state.sourceId}
          onClick={() => {
            const el = document.querySelector(`[data-indicator-id="${state.sourceId}"]`)
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      )}

      {/* Undo toast for deleted connections */}
      {lastDeleted && (
        <div
          data-testid="undo-toast"
          className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-dark-card-l2/95 px-4 py-2 text-sm text-dark-text-primary shadow-lg backdrop-blur-sm border border-dark-border"
        >
          <span>已删除挂靠</span>
          <button
            data-testid="undo-toast-button"
            onClick={undoDelete}
            className="rounded-md bg-dark-accent-primary px-2.5 py-0.5 text-xs font-medium text-white hover:bg-dark-accent-primary-hover transition-colors"
          >
            撤销
          </button>
        </div>
      )}

      {/* Command Palette */}
      <AttachmentCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        selectedIndicatorId={selectedIndicatorId}
        onSelectIndicator={handleSelectIndicator}
        onToggleTag={handleToggleTag}
        onToggleRule={handleToggleRule}
        onNavigateToTag={(tagId) => {
          const el = document.querySelector(`[data-tag-id="${tagId}"]`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
        onNavigateToRule={(ruleId) => {
          const el = document.querySelector(`[data-rule-id="${ruleId}"]`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
      />

      {/* Palette action toast */}
      {paletteToastTargetId && (
        <MiniToast targetId={paletteToastTargetId} message="✓ 已更新关联" />
      )}

      {/* Feedback animations */}
      {pulseTargetId && <PulseRing targetId={pulseTargetId} />}
      {toastTargetId && <MiniToast targetId={toastTargetId} message="✓ 指标已挂靠" />}
    </div>
  )
}
