import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Group, Panel, Separator } from 'react-resizable-panels'
import PanelHeader from '@/components/panel/PanelHeader'
import IndicatorGrid from '@/components/indicator/IndicatorGrid'
import IndicatorTreePanel, { type IndicatorTreePanelRef } from './IndicatorTreePanel'
import TagSetPanel from './TagSetPanel'
import RulePanel from './RulePanel'
import SourceAnchorMarker from '@/components/connection/SourceAnchorMarker'
import { Switch } from '@/components/ui/switch'
import { useConnectionMode } from '@/hooks/useConnectionMode'
import { initializeAttachmentStore, selectPendingIndicators, useAttachmentStore } from '@/stores/attachmentStore'

const PANEL_MIN_WIDTH_LEFT = 240
const PANEL_MIN_WIDTH_CENTER = 400
const PANEL_MIN_WIDTH_RIGHT = 240

export default function IndicatorAttachmentPage() {
  const treePanelRef = useRef<IndicatorTreePanelRef>(null)
  const { state, start, toggleContinuous } = useConnectionMode()

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
          data-testid="connection-status-bar"
          className="absolute left-0 right-0 top-0 z-40 flex items-center justify-center gap-2 bg-dark-accent-primary/90 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          <span>连线模式</span>
          <span className="text-white/70">— 按 Space 确认，ESC 取消</span>
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
                className="flex h-full flex-col rounded-lg border border-dark-border bg-dark-card-l1"
              >
                <PanelHeader title="规则" />
                <RulePanel />
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>

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
