import { useRef } from 'react'
import * as echarts from 'echarts'
import { useECharts } from '@/hooks/useECharts'
import ReportAlert from './ReportAlert'

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

export default function KnowledgeGraphChart({ nodes, edges, attribution }: KnowledgeGraphChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const option = buildGraphOption(nodes, edges)
  useECharts(containerRef, option)

  return (
    <div className="knowledge-graph-wrapper">
      <div ref={containerRef} className="knowledge-graph-chart" style={{ width: '100%', height: 400 }} />
      <div className="knowledge-graph-legend mt-3 flex flex-wrap gap-4 rounded-md border border-dark-border bg-dark-elevated p-3 text-xs text-dark-text-secondary">
        <div className="flex flex-wrap gap-3">
          {LEGEND_ITEMS.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {EDGE_LEGEND_ITEMS.map(item => (
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
