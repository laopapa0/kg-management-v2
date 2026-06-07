import { useEffect, useRef, useState, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Group, Panel, Separator } from 'react-resizable-panels'
import PanelHeader from '@/components/panel/PanelHeader'
import IndicatorGrid from '@/components/indicator/IndicatorGrid'
import IndicatorTreePanel, { type IndicatorTreePanelRef } from './IndicatorTreePanel'
import TagSetPanel from './TagSetPanel'
import RulePanel from './RulePanel'
import SourceAnchorMarker from '@/components/connection/SourceAnchorMarker'
import ConnectionLayer from '@/components/connection/ConnectionLayer'
import FocusModeOverlay from '@/components/connection/FocusModeOverlay'
import { Switch } from '@/components/ui/switch'
import { useConnectionMode } from '@/hooks/useConnectionMode'
import { useFocusZone } from '@/hooks/useFocusZone'
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
  const { state, start, toggleContinuous, resetMisfireCount } = useConnectionMode()
  const focusZone = useFocusZone()
  const focusZoneHint = useMemo(() => getFocusZoneHint(focusZone), [focusZone])

  useEffect(() => {
    initializeAttachmentStore()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      useAttachmentStore.getState().handleKeyDown(event)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
          start(card.dataset.indicatorId!, 'tree')
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

  const pendingIndicators = useAttachmentStore(useShallow(selectPendingIndicators))

  const indicatorsWithClick = pendingIndicators.map((ind) => ({
    ...ind,
    onClick: () => start(ind.id, 'tree'),
  }))

  return (
    <div
      data-testid="indicator-attachment-page"
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
          <span className="text-white/70">— 按 Space 确认，ESC 取消</span>
        </div>
      )}

      {/* Misfire hint */}
      {showHint && (
        <div
          data-testid="misfire-hint"
          className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-dark-border/80 px-4 py-2 text-xs text-dark-text-secondary backdrop-blur-sm"
        >
          请将连线拖拽到目标指标后按空格确认
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
                <span className="text-xs text-dark-text-secondary">连续挂靠</span>
                <Switch
                  checked={state.isContinuous}
                  onCheckedChange={toggleContinuous}
                  aria-label="连续挂靠"
                />
              </div>
            </div>
            <IndicatorGrid indicators={indicatorsWithClick} />
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
                <TagSetPanel />
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
                <RulePanel />
              </div>
            </Panel>
          </Group>
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
        targetType={state.targetType}
      />

      {/* SVG connection layer */}
      {state.isConnecting && state.sourceId && (
        <ConnectionLayer sourceId={state.sourceId} />
      )}

      {/* Source anchor marker when source scrolls out of viewport */}
      {state.isConnecting && state.sourceId && (
        <SourceAnchorMarker
          sourceId={state.sourceId}
          onClick={() => {
            const el = document.getElementById(state.sourceId!)
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      )}
    </div>
  )
}
