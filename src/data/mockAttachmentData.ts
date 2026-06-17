// Generated from indicatorDefinitions.ts
// 12 departments with real 一级→二级→indicator tree hierarchy
export const MOCK_DATA_VERSION = 4

import type { Department, AttachmentUiState } from '@/utils/attachmentStorage'
import type { IndicatorAttachment, TagNode, Rule, RuleParameter } from '@/models/indicatorAttachmentModel'
import { indicatorDefinitions, type IndicatorDefinition } from './indicatorDefinitions'

/**
 * 从 indicatorDefinitions 动态提取部门列表
 * id 规则：dept-${name}
 */
export const mockDepartments: Department[] = Array.from(
  new Set(indicatorDefinitions.map((ind) => ind.department).filter(Boolean))
)
  .sort()
  .map((name) => ({ id: `dept-${name}`, name }))

function createGroupNode(
  id: string,
  name: string,
  department: string,
  parentId?: string,
): IndicatorAttachment {
  return {
    id,
    name,
    code: `GROUP-${id}`,
    indicatorCode: '',
    indicatorDisplayName: name,
    indicatorShowName: name,
    indicatorType: '虚拟分组',
    level1: '',
    level2: '',
    granularity: '',
    frequency: '',
    unit: '',
    isBigScreen: false,
    department,
    businessCaliber: '',
    techCaliber: '',
    tags: [],
    treeParentId: parentId,
    tagIds: [],
    ruleIds: [],
  }
}

/**
 * 为指定部门生成指标树（包含虚拟分组节点 + 指标叶子节点）
 */
export function generateMockIndicators(departmentId: string): IndicatorAttachment[] {
  const deptName = mockDepartments.find((d) => d.id === departmentId)?.name ?? ''
  if (!deptName) return []

  // L2 "默认"虚拟分组（特殊，直接挂未分类指标）
  const pendingNodeId = `${departmentId}-pending`
  const result: IndicatorAttachment[] = [
    createGroupNode(pendingNodeId, '默认', deptName, undefined),
  ]

  const deptIndicators = indicatorDefinitions.filter((ind) => ind.department === deptName)
  const groupMap = new Map<string, IndicatorAttachment>()

  for (const ind of deptIndicators) {
    const { level1, level2 } = ind
    let treeParentId: string = (ind as any).treeParentId ?? ''

    // 未分类 → 默认 L2
    if (treeParentId === pendingNodeId || treeParentId === `dept-${deptName}-pending`) {
      result.push({
        ...(ind as IndicatorDefinition as IndicatorAttachment),
        treeParentId: pendingNodeId,
        tagIds: [],
        ruleIds: [],
      } as IndicatorAttachment)
      continue
    }

    // 正常指标 → L3 node
    // treeParentId: l3-{dept}-{level1}-{level2} or l3-{dept}-{level1}-.
    const l2Id = `l2-${deptName}-${level1}`
    const l3Id = treeParentId
    const l3Name = treeParentId.endsWith('-.') ? '.' : level2

    // L2: "{level1}" 如 效能、经营
    if (!groupMap.has(l2Id)) {
      groupMap.set(l2Id, createGroupNode(l2Id, level1, deptName, undefined))
    }

    // L3: "{level2}" or "."
    if (!groupMap.has(l3Id)) {
      groupMap.set(l3Id, createGroupNode(l3Id, l3Name, deptName, l2Id))
    }

    // L3 "." 兜底虚拟分组（每个 L2 下都建一个，即使暂时为空）
    const dotL3Id = `l3-${deptName}-${level1}-.`
    if (!groupMap.has(dotL3Id)) {
      groupMap.set(dotL3Id, createGroupNode(dotL3Id, '.', deptName, l2Id))
    }

    result.push({
      ...(ind as IndicatorDefinition as IndicatorAttachment),
      treeParentId: l3Id,
      tagIds: [],
      ruleIds: [],
    } as IndicatorAttachment)
  }

  result.push(...groupMap.values())

  // 预置 tagIds/ruleIds 关联关系（#129 指标配置记忆功能）
  const leafTags = generateMockTagNodes(departmentId)
    .filter((t) => t.parentId)
    .map((t) => t.id)
  const leafRules = generateMockRules()
    .filter((r) => r.parentId)
    .map((r) => r.id)

  result.forEach((indicator, index) => {
    const tagStart = index % leafTags.length
    const ruleStart = index % leafRules.length

    if (indicator.indicatorType === '虚拟分组') {
      indicator.tagIds = [
        leafTags[tagStart],
        leafTags[(tagStart + 1) % leafTags.length],
      ]
      indicator.ruleIds = [leafRules[ruleStart]]
    } else {
      const tagCount = 1 + (index % 3)
      const ruleCount = 1 + (index % 2)
      indicator.tagIds = Array.from({ length: tagCount }, (_, i) =>
        leafTags[(tagStart + i) % leafTags.length],
      )
      indicator.ruleIds = Array.from({ length: ruleCount }, (_, i) =>
        leafRules[(ruleStart + i) % leafRules.length],
      )
    }
  })

  return result
}

/**
 * 生成 6 条标签（3 个根分类各 2 条子标签）
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateMockTagNodes(_departmentId: string): TagNode[] {
  return [
    { id: 'tag-root-biz', name: '业务分类', color: '#3B82F6' },
    { id: 'tag-key-monitor', name: '重点监控', parentId: 'tag-root-biz', color: '#EF4444' },
    { id: 'tag-normal-monitor', name: '常规监控', parentId: 'tag-root-biz', color: '#10B981' },
    { id: 'tag-root-quality', name: '数据质量', color: '#10B981' },
    { id: 'tag-high-conf', name: '高置信度', parentId: 'tag-root-quality', color: '#10B981' },
    { id: 'tag-caliber-clear', name: '口径明确', parentId: 'tag-root-quality', color: '#3B82F6' },
    { id: 'tag-root-mgmt', name: '管理属性', color: '#8B5CF6' },
    { id: 'tag-core', name: '核心指标', parentId: 'tag-root-mgmt', color: '#8B5CF6' },
    { id: 'tag-normal', name: '普通指标', parentId: 'tag-root-mgmt', color: '#3B82F6' },
  ]
}

export const mockRuleCategories = [
  { id: 'rule-cat-threshold', name: '阈值上下限' },
  { id: 'rule-cat-topn', name: 'TOPN 监控' },
  { id: 'rule-cat-fluctuation', name: '波动算法' },
] as const

export function generateMockRules(): Rule[] {
  return [
    // 阈值上下限
    { id: 'rule-cat-threshold', name: '阈值上下限', type: 'threshold' as const, enabled: true },
    { id: 'rule-threshold-upper', name: '通用上限告警', type: 'threshold' as const, parentId: 'rule-cat-threshold', enabled: true },
    { id: 'rule-threshold-lower', name: '通用下限告警', type: 'threshold' as const, parentId: 'rule-cat-threshold', enabled: true },
    { id: 'rule-threshold-5g', name: '5G用户上限告警', type: 'threshold' as const, parentId: 'rule-cat-threshold', enabled: true },

    // TOPN 监控
    { id: 'rule-cat-topn', name: 'TOPN 监控', type: 'topn' as const, enabled: true },
    { id: 'rule-topn-desc-10', name: 'TOP10降序监控', type: 'topn' as const, parentId: 'rule-cat-topn', enabled: true },
    { id: 'rule-topn-asc-5', name: 'TOP5升序监控', type: 'topn' as const, parentId: 'rule-cat-topn', enabled: true },
    { id: 'rule-topn-anomaly-3', name: 'TOP3异常监控', type: 'topn' as const, parentId: 'rule-cat-topn', enabled: true },

    // 波动算法
    { id: 'rule-cat-fluctuation', name: '波动算法', type: 'fluctuation' as const, enabled: true },
    { id: 'rule-fluctuation-yoy', name: '同比波动检测', type: 'fluctuation' as const, parentId: 'rule-cat-fluctuation', enabled: true },
    { id: 'rule-fluctuation-mom', name: '环比波动检测', type: 'fluctuation' as const, parentId: 'rule-cat-fluctuation', enabled: true },
    { id: 'rule-fluctuation-amp', name: '波动幅度检测', type: 'fluctuation' as const, parentId: 'rule-cat-fluctuation', enabled: true },
  ]
}

export function generateMockRuleParameters(): RuleParameter[] {
  return [
    { ruleId: 'rule-threshold-upper', indicatorId: '', upperLimit: 120, lowerLimit: 80, unit: '%', level: 'P1' },
    { ruleId: 'rule-threshold-lower', indicatorId: '', upperLimit: 110, lowerLimit: 90, unit: '%', level: 'P2' },
    { ruleId: 'rule-threshold-5g', indicatorId: '', upperLimit: 95, lowerLimit: 0, unit: '%', level: 'P1' },
    { ruleId: 'rule-topn-desc-10', indicatorId: '', n: 10, dimension: 'QPS' },
    { ruleId: 'rule-topn-asc-5', indicatorId: '', n: 5, dimension: 'QPS' },
    { ruleId: 'rule-topn-anomaly-3', indicatorId: '', n: 3, dimension: 'ERROR' },
    { ruleId: 'rule-fluctuation-yoy', indicatorId: '', algorithm: '同比', window: '1M' },
    { ruleId: 'rule-fluctuation-mom', indicatorId: '', algorithm: '环比', window: '1M' },
    { ruleId: 'rule-fluctuation-amp', indicatorId: '', algorithm: '幅度', window: '1M' },
  ]
}

export function generateMockUiState(): AttachmentUiState {
  return { selectedDepartmentId: 'dept-财务部', expandedTreeNodeIds: [], expandedTagNodeIds: [], selectedIndicatorIds: [] }
}
