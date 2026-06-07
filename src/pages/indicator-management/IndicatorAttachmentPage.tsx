import { Group, Panel, Separator } from 'react-resizable-panels'
import { Tags, Scale } from 'lucide-react'
import PanelHeader from '@/components/panel/PanelHeader'
import EmptyState from '@/components/empty-state/EmptyState'
import IndicatorGrid from '@/components/indicator/IndicatorGrid'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import type { IndicatorCardProps } from '@/components/indicator/IndicatorCard'

const PANEL_MIN_WIDTH_LEFT = 240
const PANEL_MIN_WIDTH_CENTER = 400
const PANEL_MIN_WIDTH_RIGHT = 240

interface IndicatorTreeNode extends TreeNode {
  name: string
  children?: IndicatorTreeNode[]
}

const MOCK_TREE_NODES: IndicatorTreeNode[] = [
  {
    id: 'tree-root-1',
    name: '发展类指标',
    children: [
      { id: 'tree-child-1-1', name: '用户发展趋势' },
      { id: 'tree-child-1-2', name: '收入增长率' },
    ],
  },
  { id: 'tree-root-2', name: '服务类指标' },
]

const MOCK_PENDING_INDICATORS: IndicatorCardProps[] = [
  {
    id: 'ind-001',
    name: '5G用户渗透率',
    code: '5G_PENETRATION',
    level1: '发展',
    level2: '用户发展',
    source: '市场部',
  },
  {
    id: 'ind-002',
    name: '营收完成率',
    code: 'REVENUE_COMPLETION',
    level1: '经营',
    level2: '收入',
    source: '财务部',
  },
  {
    id: 'ind-003',
    name: '客户满意度',
    code: 'CSAT',
    level1: '服务',
    level2: '客户满意度',
    source: '客服部',
  },
  {
    id: 'ind-004',
    name: '网络投诉率',
    code: 'NET_COMPLAINT',
    level1: '服务',
    level2: '投诉处理',
    source: '网络部',
  },
]

export default function IndicatorAttachmentPage() {
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
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              <TreeView
                nodes={MOCK_TREE_NODES}
                renderNode={(node) => (
                  <span className="text-body text-dark-text-primary">{node.name}</span>
                )}
                initialExpanded={['tree-root-1']}
              />
            </div>
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
            <IndicatorGrid indicators={MOCK_PENDING_INDICATORS} />
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
                <EmptyState
                  icon={<Tags className="size-6" />}
                  title="暂无标签"
                  description="点击右上角 + 添加标签"
                />
              </div>
            </Panel>

            <Separator className="h-1 bg-transparent transition-colors hover:bg-dark-accent-primary" />

            <Panel id="rules" defaultSize={50} minSize={10} className="min-h-0">
              <div
                data-testid="panel-rules"
                className="flex h-full flex-col rounded-lg border border-dark-border bg-dark-card-l1"
              >
                <PanelHeader title="规则" />
                <EmptyState
                  icon={<Scale className="size-6" />}
                  title="暂无规则"
                  description="规则由系统管理员维护"
                />
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  )
}
