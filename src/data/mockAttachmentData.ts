import type { Department, AttachmentUiState } from '@/utils/attachmentStorage'
import type { IndicatorAttachment, TagNode, Rule, RuleParameter } from '@/models/indicatorAttachmentModel'

export const mockDepartments: Department[] = [
  { id: 'dept-finance', name: '财务部' },
  { id: 'dept-market', name: '市场部' },
  { id: 'dept-network', name: '网络部' },
]

const indicatorTemplates = [
  { name: '营收完成率', code: 'REV_COMPLETION', level1: '经营', level2: '收入' },
  { name: '利润贡献度', code: 'PROFIT_CONTRIBUTION', level1: '经营', level2: '利润' },
  { name: '成本费用率', code: 'COST_RATIO', level1: '经营', level2: '成本' },
  { name: 'EBITDA 完成率', code: 'EBITDA_COMPLETION', level1: '经营', level2: '收入' },
  { name: '5G 用户渗透率', code: '5G_PENETRATION', level1: '发展', level2: '用户发展' },
  { name: '新增用户数月环比', code: 'NEW_USER_MOM', level1: '发展', level2: '用户发展' },
  { name: '存量用户保有率', code: 'RETENTION_RATE', level1: '发展', level2: '用户留存' },
  { name: '客户满意度', code: 'CSAT', level1: '服务', level2: '客户满意度' },
  { name: '投诉处理及时率', code: 'COMPLAINT_TIMELY', level1: '服务', level2: '投诉处理' },
  { name: '网络接通率', code: 'NETWORK_CONNECT', level1: '服务', level2: '网络质量' },
  { name: '平均故障处理时长', code: 'MTTR', level1: '服务', level2: '网络质量' },
  { name: '装移机及时率', code: 'INSTALL_TIMELY', level1: '服务', level2: '交付效率' },
  { name: '政企收入占比', code: 'GOV_ENTERPRISE_RATIO', level1: '经营', level2: '收入分析' },
  { name: 'ARPU 值', code: 'ARPU', level1: '经营', level2: '收入' },
  { name: 'DOU 值', code: 'DOU', level1: '发展', level2: '业务发展' },
  { name: 'MOU 值', code: 'MOU', level1: '发展', level2: '业务发展' },
  { name: '离网率', code: 'CHURN_RATE', level1: '发展', level2: '用户留存' },
  { name: '宽带新增用户数', code: 'BROADBAND_NEW', level1: '发展', level2: '用户发展' },
  { name: '政企客户数', code: 'GOV_ENTERPRISE_COUNT', level1: '发展', level2: '用户发展' },
  { name: '投资回报率', code: 'ROI', level1: '经营', level2: '效益评估' },
  { name: '人均产出', code: 'PER_CAPITA_OUTPUT', level1: '经营', level2: '效益评估' },
  { name: '资源利用率', code: 'RESOURCE_UTILIZATION', level1: '服务', level2: '资源利用' },
  { name: '能耗成本', code: 'ENERGY_COST', level1: '经营', level2: '成本控制' },
  { name: '渠道发展量', code: 'CHANNEL_GROWTH', level1: '发展', level2: '业务发展' },
  { name: '服务热线接通率', code: 'HOTLINE_CONNECT', level1: '服务', level2: '服务效率' },
]

export function generateMockIndicators(departmentId: string): IndicatorAttachment[] {
  const deptName = mockDepartments.find((d) => d.id === departmentId)?.name ?? '默认部门'
  return indicatorTemplates.map((template, index) => ({
    id: `ind-${departmentId}-${index + 1}`,
    name: `${deptName}-${template.name}`,
    code: `${template.code}_${departmentId.toUpperCase().replace('DEPT-', '')}`,
    indicatorCode: template.code,
    indicatorDisplayName: template.name,
    indicatorShowName: template.name,
    indicatorType: index % 3 === 0 ? '衍生指标' : '基础指标',
    level1: template.level1,
    level2: template.level2,
    granularity: ['全局', '省分', '地市'][index % 3],
    frequency: ['月', '季', '年'][index % 3],
    unit: ['元', '百分比', '户'][index % 3],
    isBigScreen: index % 5 === 0,
    department: deptName,
    businessCaliber: `${template.name} 的业务口径说明`,
    techCaliber: `${template.name} 的技术口径说明`,
    tags: [],
    treeParentId: index === 0 ? undefined : index < 5 ? `ind-${departmentId}-1` : undefined,
    tagIds: [],
    ruleIds: [],
  }))
}

export function generateMockTagNodes(departmentId: string): TagNode[] {
  const deptSuffix = departmentId.replace('dept-', '')
  const roots: TagNode[] = [
    { id: `tag-${deptSuffix}-core`, name: '核心指标', color: '#3B82F6' },
    { id: `tag-${deptSuffix}-kpi`, name: 'KPI', color: '#10B981' },
    { id: `tag-${deptSuffix}-risk`, name: '风险监控', color: '#EF4444' },
    { id: `tag-${deptSuffix}-trend`, name: '趋势分析', color: '#F59E0B' },
    { id: `tag-${deptSuffix}-cost`, name: '成本类', color: '#8B5CF6' },
    { id: `tag-${deptSuffix}-revenue`, name: '收入类', color: '#06B6D4' },
  ]

  const children: TagNode[] = [
    { id: `tag-${deptSuffix}-core-monthly`, name: '月度核心', parentId: roots[0].id },
    { id: `tag-${deptSuffix}-core-quarterly`, name: '季度核心', parentId: roots[0].id },
    { id: `tag-${deptSuffix}-risk-high`, name: '高风险', parentId: roots[2].id },
    { id: `tag-${deptSuffix}-risk-medium`, name: '中风险', parentId: roots[2].id },
    { id: `tag-${deptSuffix}-risk-low`, name: '低风险', parentId: roots[2].id },
  ]

  return [...roots, ...children]
}

export function generateMockRules(): Rule[] {
  const roots: Rule[] = [
    { id: 'rule-threshold-revenue', name: '营收阈值告警', type: 'threshold' },
    { id: 'rule-fluctuation-cost', name: '成本波动监控', type: 'fluctuation' },
    { id: 'rule-topn-arpu', name: 'ARPU TOP-N', type: 'topn' },
    { id: 'rule-threshold-satisfaction', name: '满意度阈值', type: 'threshold' },
    { id: 'rule-fluctuation-churn', name: '离网率波动', type: 'fluctuation' },
  ]

  const children: Rule[] = [
    { id: 'rule-threshold-revenue-p1', name: 'P1 级营收阈值', type: 'threshold', parentId: roots[0].id },
    { id: 'rule-threshold-revenue-p2', name: 'P2 级营收阈值', type: 'threshold', parentId: roots[0].id },
  ]

  return [...roots, ...children]
}

export function generateMockRuleParameters(): RuleParameter[] {
  return [
    { ruleId: 'rule-threshold-revenue-p1', indicatorId: 'ind-dept-finance-1', upperLimit: 120, lowerLimit: 80, unit: '百分比', level: 'P1' },
    { ruleId: 'rule-threshold-revenue-p2', indicatorId: 'ind-dept-finance-1', upperLimit: 110, lowerLimit: 90, unit: '百分比', level: 'P2' },
    { ruleId: 'rule-fluctuation-cost', indicatorId: 'ind-dept-finance-3', upperLimit: 15, unit: '百分比', level: 'P2', algorithm: '3σ', window: '5min' },
    { ruleId: 'rule-topn-arpu', indicatorId: 'ind-dept-market-14', upperLimit: 10, unit: '个', level: 'P3', n: 10, dimension: 'QPS' },
    { ruleId: 'rule-threshold-satisfaction', indicatorId: 'ind-dept-network-8', lowerLimit: 85, unit: '分', level: 'P1' },
    { ruleId: 'rule-fluctuation-churn', indicatorId: 'ind-dept-market-17', upperLimit: 5, unit: '百分比', level: 'P2', algorithm: '环比', window: '1d' },
  ]
}

export function generateMockUiState(): AttachmentUiState {
  return {
    selectedDepartmentId: mockDepartments[0].id,
    expandedTreeNodeIds: [],
    expandedTagNodeIds: [],
    selectedIndicatorIds: [],
  }
}
