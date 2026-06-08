import { useRef, useState, useEffect } from 'react'
import * as echarts from 'echarts'
import { useECharts } from '@/hooks/useECharts'
import ReportAlert from './ReportAlert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export interface KnowledgeGraphNode {
  id: string
  name: string
  type: 'anomaly' | 'upstream' | 'deviated' | 'normal'
  value?: number
}

export interface KnowledgeGraphEdge {
  source: string
  target: string
  relation: string
  verified: boolean
}

export interface AttributionResult {
  status: 'success' | 'unsent' | 'unattributable'
  message: string
  department?: string
}

interface KnowledgeGraphChartProps {
  nodes: KnowledgeGraphNode[]
  edges: KnowledgeGraphEdge[]
  attribution?: AttributionResult
  editable?: boolean
  onEdgeDelete?: (edge: KnowledgeGraphEdge) => void
  onEdgeChange?: (oldEdge: KnowledgeGraphEdge, newEdge: KnowledgeGraphEdge) => void
}

const NODE_COLOR_MAP: Record<KnowledgeGraphNode['type'], string> = {
  anomaly: '#ef4444',
  upstream: '#3b82f6',
  deviated: '#f97316',
  normal: '#22c55e',
}

const NODE_SIZE_MAP: Record<KnowledgeGraphNode['type'], number> = {
  anomaly: 55,
  upstream: 22,
  deviated: 15,
  normal: 15,
}

function buildGraphOption(nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]): echarts.EChartsOption {
  return {
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes.map(n => ({
        id: n.id,
        name: n.name,
        value: n.value ?? NODE_SIZE_MAP[n.type],
        symbolSize: NODE_SIZE_MAP[n.type],
        itemStyle: { color: NODE_COLOR_MAP[n.type] },
        draggable: true,
      })),
      links: edges.map(e => ({
        source: e.source,
        target: e.target,
        name: e.relation,
        lineStyle: {
          width: e.verified ? 2.5 : 1,
          type: e.verified ? 'solid' : 'dashed',
        },
        label: {
          show: true,
          formatter: e.relation,
        },
      })),
      roam: true,
    }],
  }
}

const LEGEND_ITEMS = [
  { label: '异常中心', color: '#ef4444' },
  { label: '上游依赖', color: '#3b82f6' },
  { label: '已偏离邻居', color: '#f97316' },
  { label: '未偏离邻居', color: '#22c55e' },
]

const EDGE_LEGEND_ITEMS = [
  { label: '已验证传导', style: 'solid' as const, width: 2.5 },
  { label: '无数据证据', style: 'dashed' as const, width: 1 },
]

const ATTRIBUTION_VARIANT_MAP: Record<AttributionResult['status'], 'success' | 'warning' | 'info'> = {
  success: 'success',
  unsent: 'warning',
  unattributable: 'info',
}

const RELATION_OPTIONS = [
  { value: 'DEPENDS_ON', label: '依赖' },
  { value: 'CORRELATES', label: '相关' },
  { value: 'AGGREGATES', label: '聚合' },
  { value: 'DRIVES', label: '驱动' },
  { value: 'TRANSMISSION', label: '传导' },
]

export default function KnowledgeGraphChart({
  nodes,
  edges,
  attribution,
  editable,
  onEdgeDelete,
  onEdgeChange,
}: KnowledgeGraphChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverNode, setHoverNode] = useState<KnowledgeGraphNode | null>(null)
  const [hoverEdge, setHoverEdge] = useState<KnowledgeGraphEdge | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newRelation, setNewRelation] = useState('')
  const [newTarget, setNewTarget] = useState('')

  const option = buildGraphOption(nodes, edges)
  const instance = useECharts(containerRef, option)

  useEffect(() => {
    if (!instance || !editable) return

    const handleMouseOver = (params: any) => {
      if (params.dataType === 'node') {
        const node = nodes.find((n) => n.id === params.data.id)
        if (node) {
          setHoverNode(node)
          setHoverEdge(null)
        }
      } else if (params.dataType === 'edge') {
        const edge = edges.find(
          (e) => e.source === params.data.source && e.target === params.data.target,
        )
        if (edge) {
          setHoverEdge(edge)
          setHoverNode(null)
        }
      }
    }

    const handleMouseOut = () => {
      setHoverNode(null)
      setHoverEdge(null)
    }

    instance.on('mouseover', handleMouseOver)
    instance.on('mouseout', handleMouseOut)

    return () => {
      instance.off('mouseover', handleMouseOver)
      instance.off('mouseout', handleMouseOut)
    }
  }, [instance, editable, nodes, edges])

  const handleDeleteConfirm = () => {
    if (hoverEdge && onEdgeDelete) {
      onEdgeDelete(hoverEdge)
    }
    setShowDeleteDialog(false)
    setHoverEdge(null)
  }

  const handleEditConfirm = () => {
    if (hoverEdge && onEdgeChange && newRelation && newTarget) {
      onEdgeChange(hoverEdge, {
        ...hoverEdge,
        relation: newRelation,
        target: newTarget,
      })
    }
    setShowEditDialog(false)
    setHoverEdge(null)
    setNewRelation('')
    setNewTarget('')
  }

  const openEditDialog = () => {
    setNewRelation(hoverEdge?.relation ?? '')
    setNewTarget('')
    setShowEditDialog(true)
  }

  return (
    <div data-testid="knowledge-graph-chart" className="knowledge-graph-wrapper relative">
      <div ref={containerRef} className="knowledge-graph-chart" style={{ width: '100%', height: 400 }} />

      {/* 浮动操作按钮 */}
      {editable && (hoverNode || hoverEdge) && (
        <div
          data-testid="knowledge-graph-float-actions"
          className="absolute top-2 right-2 flex flex-col gap-1 rounded-md border border-dark-border bg-dark-card-l1 p-2 shadow-lg"
        >
          {hoverNode && (
            <button
              data-testid="modify-relation-btn"
              onClick={openEditDialog}
              className="rounded bg-dark-accent-primary px-2 py-1 text-xs text-white hover:bg-dark-accent-primary/90"
            >
              修改关系
            </button>
          )}
          {hoverEdge && (
            <>
              <button
                data-testid="modify-relation-btn"
                onClick={openEditDialog}
                className="rounded bg-dark-accent-primary px-2 py-1 text-xs text-white hover:bg-dark-accent-primary/90"
              >
                修改关系
              </button>
              <button
                data-testid="delete-relation-btn"
                onClick={() => setShowDeleteDialog(true)}
                className="rounded bg-error-500 px-2 py-1 text-xs text-white hover:bg-error-500/90"
              >
                删除该关系
              </button>
            </>
          )}
        </div>
      )}

      {/* 删除确认 Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除关系</DialogTitle>
            <DialogDescription>
              确定要删除 {hoverEdge?.source} → {hoverEdge?.target} 的 {hoverEdge?.relation} 关系吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              data-testid="cancel-delete-btn"
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-md border border-dark-border px-3 py-1.5 text-sm text-dark-text-secondary hover:bg-dark-card-l2"
            >
              取消
            </button>
            <button
              data-testid="confirm-delete-btn"
              onClick={handleDeleteConfirm}
              className="rounded-md bg-error-500 px-3 py-1.5 text-sm text-white hover:bg-error-500/90"
            >
              确认删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑 Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改关系</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-dark-text-secondary">关系类型</label>
              <select
                data-testid="edit-relation-select"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                className="rounded-md border border-dark-border bg-dark-card-l1 px-3 py-1.5 text-sm text-dark-text-primary"
              >
                <option value="">选择关系</option>
                {RELATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-dark-text-secondary">目标节点</label>
              <select
                data-testid="edit-target-select"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="rounded-md border border-dark-border bg-dark-card-l1 px-3 py-1.5 text-sm text-dark-text-primary"
              >
                <option value="">选择节点</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              data-testid="cancel-edit-btn"
              onClick={() => setShowEditDialog(false)}
              className="rounded-md border border-dark-border px-3 py-1.5 text-sm text-dark-text-secondary hover:bg-dark-card-l2"
            >
              取消
            </button>
            <button
              data-testid="confirm-edit-btn"
              onClick={handleEditConfirm}
              className="rounded-md bg-dark-accent-primary px-3 py-1.5 text-sm text-white hover:bg-dark-accent-primary/90"
            >
              确认修改
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="knowledge-graph-legend mt-3 flex flex-wrap gap-4 rounded-md border border-dark-border bg-dark-elevated p-3 text-xs text-dark-text-secondary">
        <div className="flex flex-wrap gap-3">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {EDGE_LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="inline-block w-6"
                style={{
                  borderBottomWidth: item.width,
                  borderBottomStyle: item.style,
                  borderBottomColor: '#9ca3af',
                  height: 0,
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {attribution && (
        <div className="knowledge-graph-attribution mt-3">
          <ReportAlert
            variant={ATTRIBUTION_VARIANT_MAP[attribution.status]}
            title="归因分析"
            message={`${attribution.message}${attribution.department ? ` 建议负责部门：${attribution.department}` : ''}`}
          />
        </div>
      )}
    </div>
  )
}
