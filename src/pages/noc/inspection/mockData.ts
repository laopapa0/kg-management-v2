/* ─── 巡检管理 mock 数据 ─── */

export interface InspectionPlan {
  id: string;
  name: string;
  triggerType: 'periodic' | 'rule-based' | 'manual';
  cronExpression?: string;
  triggerRules?: string[];
  graphVersion: string;
  indicatorScope: {
    byObjectType?: string[];
    byTags?: string[];
  };
  excludedRuleIds: string[];
  status: 'active' | 'paused';
  createdAt: string;
}

/**
 * 可用指标（平表模型）
 *
 * 与 Indicator 接口结构一致，用于巡检模块的指标引用。
 * 已从错误的树层级分类（category: '经营类'）迁移到平表属性模型。
 */
export interface AvailableIndicator {
  id: string;
  name: string;
  code: string;
  tags: string[];

  // ─── 对象类型实例值（平表）───
  level1: string;
  level2: string;
  granularity: string;
  frequency: string;
  unit: string;
  department: string;
}

export interface InspectionExecution {
  id: string;
  planId: string;
  executedAt: string;
  status: 'running' | 'completed' | 'failed';
  indicatorCount: number;
  anomalyCount: number;
}

export interface BusinessReview {
  status: 'pending' | 'saved' | 'submitted';
  evaluatedCount: number;
  totalCount: number;
}

export interface InspectionReport {
  id: string;
  name: string;
  executionId: string;
  planId: string;
  status: 'normal' | 'anomalous' | 'resolved';
  overview: {
    period: string;
    scope: string;
    anomalyStats: { total: number };
  };
  score?: {
    effectiveAnomalies: number;
    detectionScore: number;
    falsePositiveRate: number;
    overall: number;
  };
  businessReview?: BusinessReview;
  createdAt: string;
}

export const mockInspectionPlans: InspectionPlan[] = [
  {
    id: 'plan-1',
    name: '经营指标周巡检',
    triggerType: 'periodic',
    cronExpression: '每周一 09:00',
    graphVersion: 'v2.3.1',
    indicatorScope: { byObjectType: ['经营'] },
    excludedRuleIds: ['rule-holiday'],
    status: 'active',
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'plan-2',
    name: '全量指标手动巡检',
    triggerType: 'manual',
    graphVersion: 'v2.3.1',
    indicatorScope: {},
    excludedRuleIds: [],
    status: 'active',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'plan-3',
    name: '阈值告警自动巡检',
    triggerType: 'rule-based',
    triggerRules: ['rule-threshold-5g'],
    graphVersion: 'v2.3.1',
    indicatorScope: { byTags: ['黄金指标'] },
    excludedRuleIds: [],
    status: 'active',
    createdAt: '2026-05-15T14:00:00Z',
  },
  {
    id: 'plan-4',
    name: '发展指标月巡检',
    triggerType: 'periodic',
    cronExpression: '每月1号 09:00',
    graphVersion: 'v2.3.1',
    indicatorScope: { byObjectType: ['发展'] },
    excludedRuleIds: [],
    status: 'paused',
    createdAt: '2026-05-20T09:00:00Z',
  },
];

export const availableIndicators: AvailableIndicator[] = [
  { id: 'IND-0056', name: '5G用户渗透率', code: 'IND-2024-0056', level1: '发展', level2: '用户发展', granularity: '省分', frequency: '日', unit: '百分比', department: '市场部', tags: ['核心指标', '集团考核'] },
  { id: 'IND-0057', name: '5G流量占比', code: 'IND-2024-0057', level1: '发展', level2: '用户发展', granularity: '省分', frequency: '日', unit: '百分比', department: '市场部', tags: ['黄金指标'] },
  { id: 'IND-0102', name: '宽带用户数', code: 'IND-2024-0102', level1: '发展', level2: '用户发展', granularity: '全局', frequency: '月', unit: '户', department: '市场部', tags: [] },
  { id: 'IND-0089', name: '客户满意度', code: 'IND-2024-0089', level1: '服务', level2: '客户满意度', granularity: '省分', frequency: '月', unit: '分', department: '客服部', tags: ['核心指标'] },
  { id: 'IND-0076', name: '全网约收入', code: 'IND-2024-0076', level1: '经营', level2: '收入', granularity: '全局', frequency: '月', unit: '元', department: '财务部', tags: ['核心指标', '集团考核'] },
  { id: 'IND-0034', name: '网络故障率', code: 'IND-2024-0034', level1: '交付', level2: '网络质量', granularity: '地市', frequency: '实时', unit: '百分比', department: '网络部', tags: ['黄金指标'] },
  { id: 'IND-0201', name: '移动业务收入', code: 'IND-2024-0201', level1: '经营', level2: '收入', granularity: '地市', frequency: '月', unit: '元', department: '市场部', tags: ['核心指标'] },
  { id: 'IND-0151', name: '用户ARPU', code: 'IND-2024-0151', level1: '经营', level2: '效益评估', granularity: '省分', frequency: '月', unit: '元', department: '财务部', tags: [] },
  { id: 'IND-0401', name: '宽带续费率', code: 'IND-2024-0401', level1: '发展', level2: '用户留存', granularity: '地市', frequency: '月', unit: '百分比', department: '市场部', tags: ['黄金指标'] },
  { id: 'IND-0402', name: '政企收入', code: 'IND-2024-0402', level1: '经营', level2: '收入', granularity: '省分', frequency: '月', unit: '元', department: '政企部', tags: [] },
];

export const mockInspectionExecutions: InspectionExecution[] = [
  {
    id: 'exec-1',
    planId: 'plan-1',
    executedAt: '2026-05-26T09:00:00Z',
    status: 'completed',
    indicatorCount: 12,
    anomalyCount: 2,
  },
  {
    id: 'exec-2',
    planId: 'plan-3',
    executedAt: '2026-05-25T16:30:00Z',
    status: 'completed',
    indicatorCount: 5,
    anomalyCount: 1,
  },
  {
    id: 'exec-3',
    planId: 'plan-2',
    executedAt: '2026-05-20T10:00:00Z',
    status: 'completed',
    indicatorCount: 10,
    anomalyCount: 0,
  },
  {
    id: 'exec-4',
    planId: 'plan-1',
    executedAt: '2026-05-18T09:00:00Z',
    status: 'completed',
    indicatorCount: 8,
    anomalyCount: 0,
  },
  {
    id: 'exec-5',
    planId: 'plan-2',
    executedAt: '2026-04-28T10:00:00Z',
    status: 'completed',
    indicatorCount: 15,
    anomalyCount: 3,
  },
];

export const mockInspectionReports: InspectionReport[] = [
  {
    id: 'report-1',
    name: '巡检报告-20260526-001',
    executionId: 'exec-1',
    planId: 'plan-1',
    status: 'anomalous',
    overview: {
      period: '2026-05-19 ~ 2026-05-26',
      scope: '经营类指标（4 个指标）',
      anomalyStats: { total: 2 },
    },
    score: { effectiveAnomalies: 2, detectionScore: 0.4, falsePositiveRate: 0, overall: 64 },
    businessReview: { status: 'pending', evaluatedCount: 0, totalCount: 2 },
    createdAt: '2026-05-26T09:00:00Z',
  },
  {
    id: 'report-2',
    name: '巡检报告-20260520-002',
    executionId: 'exec-3',
    planId: 'plan-2',
    status: 'normal',
    overview: {
      period: '2026-05-13 ~ 2026-05-20',
      scope: '全量指标（10 个指标）',
      anomalyStats: { total: 0 },
    },
    score: { effectiveAnomalies: 0, detectionScore: 0, falsePositiveRate: 0, overall: 40 },
    createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'report-3',
    name: '巡检报告-20260525-003',
    executionId: 'exec-2',
    planId: 'plan-3',
    status: 'anomalous',
    overview: {
      period: '2026-05-18 ~ 2026-05-25',
      scope: '黄金指标（5 个指标）',
      anomalyStats: { total: 1 },
    },
    score: { effectiveAnomalies: 1, detectionScore: 0.2, falsePositiveRate: 0, overall: 52 },
    businessReview: { status: 'pending', evaluatedCount: 0, totalCount: 1 },
    createdAt: '2026-05-25T16:30:00Z',
  },
  {
    id: 'report-4',
    name: '巡检报告-20260518-004',
    executionId: 'exec-4',
    planId: 'plan-1',
    status: 'normal',
    overview: {
      period: '2026-05-11 ~ 2026-05-18',
      scope: '经营类指标（4 个指标）',
      anomalyStats: { total: 0 },
    },
    score: { effectiveAnomalies: 0, detectionScore: 0, falsePositiveRate: 0, overall: 40 },
    createdAt: '2026-05-18T09:00:00Z',
  },
  {
    id: 'report-5',
    name: '巡检报告-20260428-005',
    executionId: 'exec-5',
    planId: 'plan-2',
    status: 'resolved',
    overview: {
      period: '2026-04-21 ~ 2026-04-28',
      scope: '全量指标（10 个指标）',
      anomalyStats: { total: 3 },
    },
    score: { effectiveAnomalies: 3, detectionScore: 0.6, falsePositiveRate: 0, overall: 76 },
    businessReview: { status: 'submitted', evaluatedCount: 3, totalCount: 3 },
    createdAt: '2026-04-28T10:00:00Z',
  },
];

export const INDICATOR_TAGS = ['黄金指标', '集团考核', '核心指标'] as const;

/* ─── 辅助函数 ─── */

export function getPlanStatusCounts(plans: InspectionPlan[]) {
  let running = 0;
  let pending = 0;
  let paused = 0;

  for (const plan of plans) {
    if (plan.status === 'paused') {
      paused++;
    } else if (plan.triggerType === 'manual') {
      pending++;
    } else {
      running++;
    }
  }

  return { running, pending, paused };
}

export function getLastExecution(
  planId: string,
  executions?: InspectionExecution[]
): InspectionExecution | undefined {
  const source = executions ?? mockInspectionExecutions;
  return source
    .filter((e) => e.planId === planId)
    .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())[0];
}

export function generateMockExecution(planId: string): InspectionExecution {
  const indicatorCount = Math.floor(Math.random() * 15) + 5;
  const anomalyCount = Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0;
  return {
    id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    planId,
    executedAt: new Date().toISOString(),
    status: 'completed',
    indicatorCount,
    anomalyCount,
  };
}

export function formatTriggerType(type: InspectionPlan['triggerType']): string {
  const map: Record<string, string> = {
    periodic: '定期',
    'rule-based': '自动触发',
    manual: '手动触发',
  };
  return map[type] || type;
}

export function formatExecutionStatus(
  execution?: InspectionExecution
): { text: string; badge: 'success' | 'error' | 'warning' | 'default' } {
  if (!execution) return { text: '—', badge: 'default' as const };
  if (execution.anomalyCount === 0) return { text: '正常', badge: 'success' as const };
  return { text: '异常', badge: 'error' as const };
}

export interface RuleTreeNode {
  id: string;
  name: string;
  children?: RuleTreeNode[];
}

export const ruleTreeData: RuleTreeNode[] = [
  {
    id: 'abnormal',
    name: '异常规则',
    children: [
      {
        id: 'indicator_alert',
        name: '指标预警',
        children: [
          { id: 'threshold', name: '阈值上下限' },
          { id: 'topn', name: 'TOPN 监控' },
        ],
      },
      {
        id: 'anomaly_algo',
        name: '异常算法',
        children: [
          { id: 'fluctuation', name: '波动算法' },
          { id: 'pearson', name: '皮尔逊算法' },
        ],
      },
    ],
  },
];

/* 获取节点下所有叶子节点 ID */
export function getLeafIds(node: RuleTreeNode): string[] {
  if (!node.children || node.children.length === 0) {
    return [node.id];
  }
  return node.children.flatMap(getLeafIds);
}

/* 获取节点在树中的完整路径 */
export function getNodePath(
  tree: RuleTreeNode[],
  targetId: string
): string | undefined {
  function search(nodes: RuleTreeNode[], prefix: string[]): string | undefined {
    for (const node of nodes) {
      const currentPath = [...prefix, node.name];
      if (node.id === targetId) {
        return currentPath.join(' > ');
      }
      if (node.children) {
        const found = search(node.children, currentPath);
        if (found) return found;
      }
    }
    return undefined;
  }
  return search(tree, []);
}

/* 根据搜索词过滤树，返回包含匹配叶子及其祖先的节点 */
export function filterRuleTree(
  tree: RuleTreeNode[],
  query: string
): RuleTreeNode[] {
  if (!query.trim()) return tree;
  const lower = query.toLowerCase();

  function filterNode(node: RuleTreeNode): RuleTreeNode | null {
    const nameMatch = node.name.toLowerCase().includes(lower);
    if (!node.children || node.children.length === 0) {
      return nameMatch ? { ...node } : null;
    }
    const filteredChildren = node.children
      .map(filterNode)
      .filter((n): n is RuleTreeNode => n !== null);
    if (nameMatch || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

  return tree.map(filterNode).filter((n): n is RuleTreeNode => n !== null);
}

/**
 * 根据对象类型属性值和标签筛选指标
 *
 * 已从错误的 category 筛选迁移到平表属性筛选。
 * selectedCategories 现在表示一级对象类型值（如 '经营'、'发展'）。
 */
export function getMatchingIndicators(
  indicators: AvailableIndicator[],
  selectedCategories: string[],
  selectedTags: string[]
): AvailableIndicator[] {
  if (selectedCategories.length === 0 && selectedTags.length === 0) {
    return indicators;
  }

  return indicators.filter((ind) => {
    const categoryMatch =
      selectedCategories.length === 0 || selectedCategories.includes(ind.level1);
    const tagMatch =
      selectedTags.length === 0 || ind.tags.some((tag) => selectedTags.includes(tag));
    return categoryMatch && tagMatch;
  });
}

/* ─── 报告相关辅助函数 ─── */

export function getExecutionById(
  execId: string,
  executions?: InspectionExecution[]
): InspectionExecution | undefined {
  const source = executions ?? mockInspectionExecutions;
  return source.find((e) => e.id === execId);
}

export function getPlanNameById(
  planId: string,
  plans?: InspectionPlan[]
): string | undefined {
  const source = plans ?? mockInspectionPlans;
  return source.find((p) => p.id === planId)?.name;
}

export function formatReportStatus(report: InspectionReport): {
  text: string;
  badge: 'success' | 'error' | 'primary';
} {
  switch (report.status) {
    case 'normal':
      return { text: '正常', badge: 'success' };
    case 'anomalous':
      return { text: '异常', badge: 'error' };
    case 'resolved':
      return { text: '已处理', badge: 'primary' };
    default:
      return { text: '未知', badge: 'primary' };
  }
}

/** 判断日期是否在本周（周一 00:00 ~ 周日 23:59） */
export function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return date >= monday && date <= sunday;
}

/** 判断日期是否在本月 */
export function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

/** 判断日期是否在指定范围内（含边界） */
export function isInDateRange(
  dateStr: string,
  startStr: string,
  endStr: string
): boolean {
  const date = new Date(dateStr);
  const start = new Date(startStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endStr);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

/* ═══════════════════════════════════════════════
   Slice 7 — 异常明细、趋势、血缘数据
   ═══════════════════════════════════════════════ */

export interface AnomalyItem {
  id: string;
  indicatorId: string;
  indicatorName: string;
  indicatorCode: string;
  currentValue: number;
  deviation: number;
  hitRules: { ruleId: string; ruleName: string }[];
  evaluation?: {
    isFalsePositive: boolean;
    comment?: string;
  };
  trendData?: {
    unit: string;
    data: TrendDataPoint[];
  };
  lineage?: {
    nodes: LineageNode[];
    edges: LineageEdge[];
  };
  suggestion?: {
    content: string;
    source: 'llm' | 'knowledge';
    knowledgeBases: string[];
  };
}

export interface TrendDataPoint {
  date: string;
  current: number;
  previous: number;

}

export interface IndicatorTrend {
  indicatorId: string;
  indicatorName: string;
  unit: string;
  data: TrendDataPoint[];
}

export interface LineageNode {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  role: 'root-cause' | 'anomaly' | 'impact' | 'normal';
}

export interface LineageEdge {
  sourceId: string;
  targetId: string;
  type: string;
}

export const mockAnomalyItems: AnomalyItem[] = [
  {
    id: 'anom-1',
    indicatorId: 'IND-0056',
    indicatorName: '5G用户渗透率',
    indicatorCode: 'IND-2024-0056',
    currentValue: 97.0,
    deviation: 2.1,
    hitRules: [
      { ruleId: 'threshold', ruleName: '阈值上下限' },
    ],
    trendData: {
      unit: '%',
      data: [
        { date: '05-20', current: 95, previous: 94 },
        { date: '05-21', current: 96, previous: 95 },
        { date: '05-22', current: 96, previous: 95 },
        { date: '05-23', current: 97, previous: 95 },
        { date: '05-24', current: 97, previous: 96 },
        { date: '05-25', current: 97, previous: 96 },
        { date: '05-26', current: 97, previous: 96 },
      ],
    },
    lineage: {
      nodes: [
        { id: 'node-1', name: '基站覆盖数', category: '交付', x: 20, y: 20, role: 'root-cause' },
        { id: 'node-2', name: '5G用户渗透率', category: '发展', x: 180, y: 20, role: 'anomaly' },
        { id: 'node-3', name: '5G流量占比', category: '发展', x: 340, y: 0, role: 'impact' },
        { id: 'node-4', name: '移动业务收入', category: '经营', x: 340, y: 80, role: 'impact' },
      ],
      edges: [
        { sourceId: 'node-1', targetId: 'node-2', type: 'CAUSES' },
        { sourceId: 'node-2', targetId: 'node-3', type: 'CAUSES' },
        { sourceId: 'node-2', targetId: 'node-4', type: 'DEPENDS_ON' },
      ],
    },
    suggestion: {
      content: '当前 5G 用户渗透率已超过基线值 95%，达到 97%。建议：1) 检查数据源是否准确，排除统计口径差异；2) 评估是否需要上调基线阈值至 98%；3) 关注下游指标「5G流量占比」和「移动业务收入」的联动变化。',
      source: 'knowledge',
      knowledgeBases: ['5G业务发展规范 v2.3'],
    },
  },
  {
    id: 'anom-2',
    indicatorId: 'IND-0034',
    indicatorName: '网络故障率',
    indicatorCode: 'IND-2024-0034',
    currentValue: 3.2,
    deviation: 28.0,
    hitRules: [
      { ruleId: 'fluctuation', ruleName: '波动算法' },
    ],
    trendData: {
      unit: '%',
      data: [
        { date: '05-20', current: 2.5, previous: 2.3 },
        { date: '05-21', current: 2.6, previous: 2.4 },
        { date: '05-22', current: 2.8, previous: 2.5 },
        { date: '05-23', current: 3.0, previous: 2.5 },
        { date: '05-24', current: 3.1, previous: 2.6 },
        { date: '05-25', current: 3.2, previous: 2.6 },
        { date: '05-26', current: 3.2, previous: 2.7 },
      ],
    },
    suggestion: {
      content: '网络故障率当前 3.2%，较基线 2.5% 上升 28%。建议：1) 排查近期网络割接或升级操作记录；2) 重点监控「网络负荷」指标，确认是否触发扩容需求；3) 参考《网络质量监控指南》中的故障分级处置流程。',
      source: 'knowledge',
      knowledgeBases: ['网络质量监控指南'],
    },
  },
  {
    id: 'anom-3',
    indicatorId: 'IND-0057',
    indicatorName: '5G流量占比',
    indicatorCode: 'IND-2024-0057',
    currentValue: 45.0,
    deviation: 7.1,
    hitRules: [
      { ruleId: 'threshold', ruleName: '阈值上下限' },
    ],
  },
  {
    id: 'anom-4',
    indicatorId: 'IND-0401',
    indicatorName: '宽带续费率',
    indicatorCode: 'IND-2024-0401',
    currentValue: 82.0,
    deviation: -3.5,
    hitRules: [
      { ruleId: 'pearson', ruleName: '皮尔逊算法' },
    ],
    evaluation: { isFalsePositive: false, comment: '季节性波动，非真实异常' },
  },
];

export const mockIndicatorTrends: IndicatorTrend[] = [
  {
    indicatorId: 'IND-0056',
    indicatorName: '5G用户渗透率',
    unit: '%',
    data: [
      { date: '05-20', current: 92.0, previous: 90.0 },
      { date: '05-21', current: 93.2, previous: 90.5 },
      { date: '05-22', current: 94.1, previous: 91.5 },
      { date: '05-23', current: 95.0, previous: 92.5 },
      { date: '05-24', current: 95.8, previous: 93.0 },
      { date: '05-25', current: 96.5, previous: 93.5 },
      { date: '05-26', current: 97.0, previous: 94.0 },
    ],
  },
  {
    indicatorId: 'IND-0034',
    indicatorName: '网络故障率',
    unit: '%',
    data: [
      { date: '05-20', current: 2.1, previous: 2.0 },
      { date: '05-21', current: 2.3, previous: 2.1 },
      { date: '05-22', current: 2.5, previous: 2.2 },
      { date: '05-23', current: 2.7, previous: 2.3 },
      { date: '05-24', current: 2.9, previous: 2.4 },
      { date: '05-25', current: 3.0, previous: 2.4 },
      { date: '05-26', current: 3.2, previous: 2.5 },
    ],
  },
];

export const mockLineageSnapshots: Record<string, { nodes: LineageNode[]; edges: LineageEdge[] }> = {
  'IND-0056': {
    nodes: [
      { id: 'n8', name: '客户满意度', category: '服务', x: 60, y: 120, role: 'normal' },
      { id: 'n12', name: '基站覆盖数', category: '交付', x: 200, y: 40, role: 'root-cause' },
      { id: 'n1', name: '5G用户渗透率', category: '发展', x: 200, y: 120, role: 'anomaly' },
      { id: 'n4', name: '5G流量占比', category: '发展', x: 340, y: 80, role: 'impact' },
      { id: 'n2', name: '移动业务收入', category: '经营', x: 340, y: 160, role: 'impact' },
    ],
    edges: [
      { sourceId: 'n12', targetId: 'n1', type: 'CAUSES' },
      { sourceId: 'n8', targetId: 'n1', type: 'CAUSES' },
      { sourceId: 'n1', targetId: 'n4', type: 'CAUSES' },
      { sourceId: 'n1', targetId: 'n2', type: 'DEPENDS_ON' },
    ],
  },
  'IND-0034': {
    nodes: [
      { id: 'n5', name: '网络负荷', category: '交付', x: 100, y: 120, role: 'root-cause' },
      { id: 'n3', name: '网络故障率', category: '交付', x: 260, y: 120, role: 'anomaly' },
      { id: 'n6', name: '扩容需求', category: '交付', x: 420, y: 120, role: 'impact' },
    ],
    edges: [
      { sourceId: 'n5', targetId: 'n3', type: 'CAUSES' },
      { sourceId: 'n3', targetId: 'n6', type: 'DEPENDS_ON' },
    ],
  },
};

/* ─── Slice 7 辅助函数 ─── */

export function getAnomaliesByReportId(
  reportId: string,
  reports?: InspectionReport[],
  anomalies?: AnomalyItem[]
): AnomalyItem[] {
  const report = (reports ?? mockInspectionReports).find((r) => r.id === reportId);
  if (!report || report.overview.anomalyStats.total === 0) return [];
  // 简化：按报告关联的计划 ID 来取异常
  // report-1 (plan-1) → anom-1, anom-2
  // report-3 (plan-3) → anom-3
  // report-5 (plan-2) → anom-4
  const source = anomalies ?? mockAnomalyItems;
  if (reportId === 'report-1') return source.filter((a) => a.id === 'anom-1' || a.id === 'anom-2');
  if (reportId === 'report-3') return source.filter((a) => a.id === 'anom-3');
  if (reportId === 'report-5') return source.filter((a) => a.id === 'anom-4');
  return [];
}

export function getTrendsByIndicatorIds(
  indicatorIds: string[],
  trends?: IndicatorTrend[]
): IndicatorTrend[] {
  const source = trends ?? mockIndicatorTrends;
  return source.filter((t) => indicatorIds.includes(t.indicatorId));
}

export function getLineageByIndicatorId(
  indicatorId: string,
  snapshots?: Record<string, { nodes: LineageNode[]; edges: LineageEdge[] }>
): { nodes: LineageNode[]; edges: LineageEdge[] } | null {
  const source = snapshots ?? mockLineageSnapshots;
  return source[indicatorId] || null;
}

export function getDeviationColor(deviation: number): string {
  const abs = Math.abs(deviation);
  if (abs < 5) return 'text-[#059669]';
  if (abs < 15) return 'text-[#d97706]';
  return 'text-[#dc2626]';
}

export function getDeviationBg(deviation: number): string {
  const abs = Math.abs(deviation);
  if (abs < 5) return 'bg-[#ecfdf5]';
  if (abs < 15) return 'bg-[#fffbeb]';
  return 'bg-[#fef2f2]';
}

/* ─── 业务部门评价相关 ─── */

export type EvaluationMap = Record<string, {
  isFalsePositive: boolean;
  comment?: string;
}>;

export function evaluateReportStatus(
  anomalies: AnomalyItem[],
  draftEvaluations: EvaluationMap
): {
  status: 'pending' | 'saved' | 'submitted';
  evaluatedCount: number;
  totalCount: number;
} {
  const totalCount = anomalies.length;
  if (totalCount === 0) {
    return { status: 'pending', evaluatedCount: 0, totalCount: 0 };
  }

  const evaluatedCount = anomalies.filter((a) => draftEvaluations[a.id] !== undefined).length;
  const status = evaluatedCount === totalCount ? 'saved' : 'pending';

  return { status, evaluatedCount, totalCount };
}

export function computeFalsePositiveRate(evaluations: EvaluationMap): number {
  const entries = Object.values(evaluations);
  if (entries.length === 0) return 0;
  const falsePositiveCount = entries.filter((e) => e.isFalsePositive).length;
  return falsePositiveCount / entries.length;
}

/**
 * 提交报告评价：将评价草稿正式写入 anomaly.evaluation，
 * 更新 report.score（误报率回流），更新 businessReview.status。
 */
export function submitReportEvaluation(
  reportId: string,
  evaluations: EvaluationMap,
  options?: {
    reports?: InspectionReport[];
    anomalies?: AnomalyItem[];
    clearDraft?: (reportId: string) => void;
  }
): void {
  const reports = options?.reports ?? mockInspectionReports;
  const anomalies = options?.anomalies ?? mockAnomalyItems;

  // 1. 将评价写入 anomaly.evaluation
  for (const [anomalyId, evaluation] of Object.entries(evaluations)) {
    const anomaly = anomalies.find((a) => a.id === anomalyId);
    if (anomaly) {
      anomaly.evaluation = { ...evaluation };
    }
  }

  // 2. 计算误报率
  const falsePositiveRate = computeFalsePositiveRate(evaluations);

  // 3. 更新 report.score 和 businessReview
  const report = reports.find((r) => r.id === reportId);
  if (report) {
    const anomalyCount = report.overview.anomalyStats.total;
    report.score = calculateReportValueScore(anomalyCount, falsePositiveRate);
    report.businessReview = {
      status: 'submitted',
      evaluatedCount: anomalyCount,
      totalCount: anomalyCount,
    };
  }

  // 4. 清除草稿
  options?.clearDraft?.(reportId);
}

/* ─── 知识库文档（用于处置建议匹配） ─── */

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export const knowledgeDocs: KnowledgeDoc[] = [
  { id: 'DOC-001', title: '5G业务发展规范 v2.3', category: '业务规范', summary: '定义5G业务发展的各项指标标准和口径，包含用户渗透率、流量占比等核心指标的计算方法和预警阈值建议。' },
  { id: 'DOC-002', title: '收入指标计算口径说明', category: '口径说明', summary: '详细说明各类收入指标的计算方法和数据来源，包含移动业务收入、家庭业务收入等。' },
  { id: 'DOC-003', title: '客户满意度评价标准', category: '评价标准', summary: '客户满意度指标的评价维度和打分标准，以及满意度与业务发展的关联分析。' },
  { id: 'DOC-004', title: '网络质量监控指南', category: '监控指南', summary: '网络质量相关指标的监控方法和阈值建议，包含网络故障率、网络负荷等指标的异常处置流程。' },
  { id: 'DOC-005', title: '宽带业务发展规范 v1.8', category: '业务规范', summary: '宽带业务发展的各项指标标准和口径说明，包含宽带续费率、用户留存等关键指标的优化策略。' },
];

/** 根据指标名称匹配相关知识库文档 */
/* ─── 报告价值评分计算 ─── */

export function calculateReportValueScore(
  anomalyCount: number,
  falsePositiveCountOrRate: number,
  targetValue: number = 5
): {
  effectiveAnomalies: number;
  detectionScore: number;
  falsePositiveRate: number;
  overall: number;
} {
  const falsePositiveRate =
    falsePositiveCountOrRate <= 1
      ? falsePositiveCountOrRate
      : falsePositiveCountOrRate / anomalyCount;

  const effectiveAnomalies = anomalyCount * (1 - falsePositiveRate);
  const detectionScore = anomalyCount === 0 ? 0 : Math.min(effectiveAnomalies, targetValue) / targetValue;
  const overall = (0.6 * detectionScore + 0.4 * (1 - falsePositiveRate)) * 100;

  return {
    effectiveAnomalies,
    detectionScore,
    falsePositiveRate,
    overall,
  };
}

export function getKnowledgeDocsForIndicator(indicatorName: string): KnowledgeDoc[] {
  const map: Record<string, string[]> = {
    '5G用户渗透率': ['DOC-001'],
    '5G流量占比': ['DOC-001'],
    移动业务收入: ['DOC-002'],
    客户满意度: ['DOC-003'],
    网络故障率: ['DOC-004'],
    网络负荷: ['DOC-004'],
    宽带用户数: ['DOC-005'],
    宽带续费率: ['DOC-005'],
  };
  const docIds = map[indicatorName] || [];
  return knowledgeDocs.filter((d) => docIds.includes(d.id));
}
