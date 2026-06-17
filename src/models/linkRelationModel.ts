export interface LinkRelation {
  id: string
  code: string
  name: string
  displayName: string
  description: string
  direction: '有向' | '无向'
  color: string
  icon: string
  sourceTypes: string[]
  targetTypes: string[]
  enabled: boolean
  usageCount: number
  createdAt: string
}

/** 关系类型在某条连线上的使用记录 */
export interface LinkUsageConnection {
  sourceName: string
  targetName: string
  createdAt: string
}

/** 关系类型的使用追踪 */
export interface LinkUsage {
  relationId: string
  connectionCount: number
  connections: LinkUsageConnection[]
}

/** 单条变更记录 */
export interface ChangeLogEntry {
  timestamp: string
  type: '新增' | '修改' | '删除'
  field: string
  oldValue: string
  newValue: string
  operator: string
}

/** 关系类型的变更历史 */
export interface LinkChangeLog {
  relationId: string
  changes: ChangeLogEntry[]
}

export const mockLinkRelations: LinkRelation[] = [
  {
    id: 'LKT-001',
    code: 'AGGREGATES',
    name: 'AGGREGATES',
    displayName: '聚合关系',
    description: '子指标汇总为父指标',
    direction: '有向',
    color: '#10B981',
    icon: 'Combine',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: true,
    usageCount: 12,
    createdAt: '2026-01-15',
  },
  {
    id: 'LKT-002',
    code: 'DEPENDS_ON',
    name: 'DEPENDS_ON',
    displayName: '依赖关系',
    description: '指标依赖于上游指标',
    direction: '有向',
    color: '#3B82F6',
    icon: 'Link',
    sourceTypes: ['指标', '虚拟分组'],
    targetTypes: ['指标', '虚拟分组'],
    enabled: true,
    usageCount: 34,
    createdAt: '2026-01-20',
  },
  {
    id: 'LKT-003',
    code: 'DRIVES',
    name: 'DRIVES',
    displayName: '驱动关系',
    description: '指标驱动下游业务',
    direction: '有向',
    color: '#F59E0B',
    icon: 'ArrowRight',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: true,
    usageCount: 0,
    createdAt: '2026-02-01',
  },
  {
    id: 'LKT-004',
    code: 'TRANSMISSION',
    name: 'TRANSMISSION',
    displayName: '传导关系',
    description: '异常在指标间传导',
    direction: '有向',
    color: '#06B6D4',
    icon: 'GitBranch',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: true,
    usageCount: 21,
    createdAt: '2026-02-10',
  },
  {
    id: 'LKT-005',
    code: 'CORRELATES',
    name: 'CORRELATES',
    displayName: '相关关系',
    description: '指标间存在统计相关性',
    direction: '无向',
    color: '#6B7280',
    icon: 'Shuffle',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: false,
    usageCount: 0,
    createdAt: '2026-03-01',
  },
  {
    id: 'LKT-006',
    code: 'CAUSES',
    name: 'CAUSES',
    displayName: '因果关系',
    description: '指标间存在因果逻辑',
    direction: '有向',
    color: '#EC4899',
    icon: 'TrendingUp',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: true,
    usageCount: 0,
    createdAt: '2026-03-15',
  },
  {
    id: 'LKT-007',
    code: 'DERIVES',
    name: 'DERIVES',
    displayName: '派生关系',
    description: '指标由其他指标计算得出',
    direction: '有向',
    color: '#8B5CF6',
    icon: 'Layers',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: false,
    usageCount: 0,
    createdAt: '2026-04-01',
  },
  {
    id: 'LKT-008',
    code: 'PART_OF',
    name: 'PART_OF',
    displayName: '组成关系',
    description: '源指标是目标指标的组成部分',
    direction: '有向',
    color: '#F97316',
    icon: 'PieChart',
    sourceTypes: ['虚拟分组'],
    targetTypes: ['指标'],
    enabled: false,
    usageCount: 0,
    createdAt: '2026-04-10',
  },
  {
    id: 'LKT-009',
    code: 'REPLACES',
    name: 'REPLACES',
    displayName: '替代关系',
    description: '源指标替代了目标指标',
    direction: '有向',
    color: '#EF4444',
    icon: 'Replace',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: false,
    usageCount: 0,
    createdAt: '2026-04-20',
  },
  {
    id: 'LKT-010',
    code: 'REFERENCES',
    name: 'REFERENCES',
    displayName: '引用关系',
    description: '源指标引用了目标指标的定义',
    direction: '有向',
    color: '#14B8A6',
    icon: 'ExternalLink',
    sourceTypes: ['指标'],
    targetTypes: ['指标'],
    enabled: false,
    usageCount: 0,
    createdAt: '2026-05-01',
  },
]

/* AI推荐 */
export interface AiRecommendation {
  id: string
  sourceIndicatorId: string
  sourceIndicatorName: string
  sourceDepartment: string
  targetIndicatorId: string
  targetIndicatorName: string
  targetDepartment: string
  relationTypeId: string
  relationTypeName: string
  confidence: number
  reason?: string
}

const RELATION_TYPE_NAMES: Record<string, string> = {
  AGGREGATES: '聚合关系',
  DRIVES: '驱动关系',
  DEPENDS_ON: '依赖关系',
  CAUSES: '因果关系',
  TRANSMISSION: '传导关系',
}

import { mockAppliedConnections, mockAiRecommendations as rawAiRecs } from '@/data/aiRecommendations'
import { indicatorDefinitions } from '@/data/indicatorDefinitions'

const codeToName = new Map(indicatorDefinitions.map((d) => [d.code, d.name]))

function mapToAiRec(r: typeof rawAiRecs[number], index: number): AiRecommendation {
  const srcName = codeToName.get(r.sourceId) ?? r.sourceId
  const tgtName = codeToName.get(r.targetId) ?? r.targetId
  return {
    id: `ai-rec-${index.toString().padStart(3, '0')}`,
    sourceIndicatorId: r.sourceId,
    sourceIndicatorName: srcName,
    sourceDepartment: '',
    targetIndicatorId: r.targetId,
    targetIndicatorName: tgtName,
    targetDepartment: '',
    relationTypeId: r.relationTypeId,
    relationTypeName: RELATION_TYPE_NAMES[r.relationTypeId] ?? r.relationTypeId,
    confidence: r.confidence,
    reason: r.reason,
  }
}

export const mockAiRecommendations: AiRecommendation[] = rawAiRecs.map((r, i) => mapToAiRec(r, i))

function buildLinkUsages(): LinkUsage[] {
  const groups = new Map<string, typeof mockAppliedConnections>()
  for (const c of mockAppliedConnections) {
    if (!groups.has(c.relationTypeId)) groups.set(c.relationTypeId, [])
    groups.get(c.relationTypeId)!.push(c)
  }
  return Array.from(groups.entries()).map(([relName, conns]) => ({
    relationId: mockLinkRelations.find((r) => r.name === relName)?.id ?? relName,
    connectionCount: conns.length,
    connections: conns.map((c) => ({
      sourceName: c.sourceId,
      targetName: c.targetId,
      createdAt: '2026-06-01',
    })),
  }))
}

export const mockLinkUsages: LinkUsage[] = buildLinkUsages()

export const mockLinkChangeLogs: LinkChangeLog[] = []