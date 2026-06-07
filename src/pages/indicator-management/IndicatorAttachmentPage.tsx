import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Group, Panel, Separator } from 'react-resizable-panels'
import PanelHeader from '@/components/panel/PanelHeader'
import IndicatorGrid from '@/components/indicator/IndicatorGrid'
import IndicatorTreePanel from './IndicatorTreePanel'
import TagSetPanel from './TagSetPanel'
import RulePanel from './RulePanel'
import { initializeAttachmentStore, selectPendingIndicators, useAttachmentStore } from '@/stores/attachmentStore'

const PANEL_MIN_WIDTH_LEFT = 240
const PANEL_MIN_WIDTH_CENTER = 400
const PANEL_MIN_WIDTH_RIGHT = 240

export default function IndicatorAttachmentPage() {
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

  const pendingIndicators = useAttachmentStore(useShallow(selectPendingIndicators))

  return (
    <div
      data-testid="indicator-attachment-page"
      className="h-full w-full bg-dark-page p-3 text-dark-text-primary"
    >
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
                // eslint-disable-next-line no-console
                console.log('add indicator tree node')
              }}
            />
            <IndicatorTreePanel />
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
            <PanelHeader
              title="待选指标"
              onAdd={() => {
                // eslint-disable-next-line no-console
                console.log('add pending indicator')
              }}
            />
            <IndicatorGrid indicators={pendingIndicators} />
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
                    // eslint-disable-next-line no-console
                    console.log('add tag')
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
    </div>
  )
}
