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
  lastModifiedBy: string
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
    lastModifiedBy: '张三',
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
    lastModifiedBy: '李四',
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
    enabled: false,
    usageCount: 8,
    createdAt: '2026-02-01',
    lastModifiedBy: '王五',
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
    lastModifiedBy: 'AI',
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
    usageCount: 5,
    createdAt: '2026-03-01',
    lastModifiedBy: '张三',
  },
  {
    id: 'LKT-006',
    code: 'INFLUENCES',
    name: 'INFLUENCES',
    displayName: '影响关系',
    description: '外部因素对指标的影响',
    direction: '有向',
    color: '#EC4899',
    icon: 'TrendingUp',
    sourceTypes: ['指标', '外部因素'],
    targetTypes: ['指标'],
    enabled: true,
    usageCount: 17,
    createdAt: '2026-03-15',
    lastModifiedBy: '李四',
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
    enabled: true,
    usageCount: 29,
    createdAt: '2026-04-01',
    lastModifiedBy: '王五',
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
    enabled: true,
    usageCount: 15,
    createdAt: '2026-04-10',
    lastModifiedBy: 'AI',
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
    enabled: true,
    usageCount: 6,
    createdAt: '2026-04-20',
    lastModifiedBy: '张三',
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
    enabled: true,
    usageCount: 11,
    createdAt: '2026-05-01',
    lastModifiedBy: '李四',
  },
]

// ─── 使用追踪 mock ───
export const mockLinkUsages: LinkUsage[] = [
  {
    relationId: 'LKT-001',
    connectionCount: 3,
    connections: [
      { sourceName: '月_收入_总收入', targetName: '季_收入_总收入', createdAt: '2026-01-16' },
      { sourceName: '日_用户_新增用户', targetName: '月_用户_新增用户', createdAt: '2026-02-01' },
      { sourceName: '月_成本_运营成本', targetName: '季_成本_总成本', createdAt: '2026-02-15' },
    ],
  },
  {
    relationId: 'LKT-002',
    connectionCount: 5,
    connections: [
      { sourceName: '月_收入_主营业务收入', targetName: '月_收入_总收入', createdAt: '2026-01-21' },
      { sourceName: '日_网络_基站数', targetName: '月_网络_覆盖率', createdAt: '2026-02-05' },
      { sourceName: '月_用户_活跃用户', targetName: '月_用户_留存率', createdAt: '2026-03-01' },
      { sourceName: '周_服务_投诉量', targetName: '月_服务_满意度', createdAt: '2026-03-10' },
      { sourceName: '月_交付_订单量', targetName: '月_交付_交付率', createdAt: '2026-04-01' },
    ],
  },
  {
    relationId: 'LKT-003',
    connectionCount: 2,
    connections: [
      { sourceName: '月_收入_总收入', targetName: '经营分析大屏', createdAt: '2026-02-05' },
      { sourceName: '月_用户_新增用户', targetName: '用户增长看板', createdAt: '2026-03-01' },
    ],
  },
  {
    relationId: 'LKT-004',
    connectionCount: 4,
    connections: [
      { sourceName: '月_网络_延迟', targetName: '月_网络_丢包率', createdAt: '2026-02-15' },
      { sourceName: '月_网络_丢包率', targetName: '月_服务_投诉量', createdAt: '2026-03-01' },
      { sourceName: '日_成本_能耗', targetName: '月_成本_运营成本', createdAt: '2026-03-20' },
      { sourceName: '月_交付_交付率', targetName: '月_收入_客户收入', createdAt: '2026-04-10' },
    ],
  },
  {
    relationId: 'LKT-005',
    connectionCount: 1,
    connections: [
      { sourceName: '月_用户_活跃用户', targetName: '月_收入_总收入', createdAt: '2026-03-10' },
    ],
  },
  {
    relationId: 'LKT-006',
    connectionCount: 2,
    connections: [
      { sourceName: '季节性波动', targetName: '月_收入_总收入', createdAt: '2026-04-01' },
      { sourceName: '政策调整', targetName: '月_成本_运营成本', createdAt: '2026-05-01' },
    ],
  },
  {
    relationId: 'LKT-007',
    connectionCount: 4,
    connections: [
      { sourceName: '月_收入_A产品收入', targetName: '月_收入_总收入', createdAt: '2026-04-10' },
      { sourceName: '月_收入_B产品收入', targetName: '月_收入_总收入', createdAt: '2026-04-15' },
      { sourceName: '月_成本_人力成本', targetName: '月_成本_运营成本', createdAt: '2026-05-01' },
      { sourceName: '月_成本_物料成本', targetName: '月_成本_运营成本', createdAt: '2026-05-10' },
    ],
  },
]

// ─── 变更记录 mock ───
// 记录业务部门调整指标与指标间关联关系的操作历史
export const mockLinkChangeLogs: LinkChangeLog[] = [
  {
    relationId: 'LKT-001',
    changes: [
      { timestamp: '2026-01-15 09:30:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“月_收入_总收入”与“季_收入_总收入”的汇总聚合关系', operator: '财务部-张三' },
      { timestamp: '2026-02-20 14:15:00', type: '修改', field: 'description', oldValue: '“月_收入_总收入”直接汇总到“季_收入_总收入”', newValue: '“月_收入_总收入”通过“月_收入_净收入”间接汇总至“季_收入_总收入”', operator: '财务部-张三' },
    ],
  },
  {
    relationId: 'LKT-002',
    changes: [
      { timestamp: '2026-01-20 10:00:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“日_活跃用户_DAU”依赖“日_新增用户_NewUsers”的因果依赖关系', operator: '市场部-李四' },
      { timestamp: '2026-03-05 11:20:00', type: '修改', field: 'description', oldValue: '“日_活跃用户_DAU”单向依赖“日_新增用户_NewUsers”', newValue: '“日_活跃用户_DAU”与“日_新增用户_NewUsers”互为双向依赖', operator: '市场部-李四' },
      { timestamp: '2026-03-10 16:45:00', type: '修改', field: 'direction', oldValue: '有向', newValue: '无向', operator: '市场部-王五' },
    ],
  },
  {
    relationId: 'LKT-003',
    changes: [
      { timestamp: '2026-02-01 08:00:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“月_营收_总收入”驱动“月_利润_净利润”的业务驱动关系', operator: '财务部-张三' },
      { timestamp: '2026-04-12 09:10:00', type: '修改', field: 'description', oldValue: '“月_营收_总收入”驱动“月_利润_净利润”的计算', newValue: '“月_营收_总收入”和“月_成本_总成本”共同驱动“月_利润_净利润”', operator: '财务部-赵六' },
    ],
  },
  {
    relationId: 'LKT-004',
    changes: [
      { timestamp: '2026-02-10 13:30:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“周_工单_总量”传递至“月_工单_完成率”的数据传递关系', operator: '运营部-陈七' },
    ],
  },
  {
    relationId: 'LKT-005',
    changes: [
      { timestamp: '2026-03-01 09:00:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“日_广告_曝光量”影响“日_收入_广告收入”的市场影响关系', operator: '市场部-李四' },
      { timestamp: '2026-05-15 10:30:00', type: '修改', field: 'description', oldValue: '“日_广告_曝光量”影响“日_收入_广告收入”', newValue: '“日_广告_曝光量”和“日_广告_点击率”共同影响“日_收入_广告收入”', operator: '市场部-王五' },
    ],
  },
  {
    relationId: 'LKT-006',
    changes: [
      { timestamp: '2026-03-15 11:00:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“日_用户_新增”关联“日_收入_新增用户ARPU”的关联分析关系', operator: '财务部-赵六' },
      { timestamp: '2026-04-20 15:20:00', type: '修改', field: 'sourceTypes', oldValue: '指标', newValue: '指标,外部因素', operator: '财务部-赵六' },
    ],
  },
  {
    relationId: 'LKT-007',
    changes: [
      { timestamp: '2026-04-01 10:00:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建“月_用户_MAU”派生“日_用户_DAU日均”的指标派生关系', operator: '运营部-陈七' },
      { timestamp: '2026-05-01 14:00:00', type: '修改', field: 'description', oldValue: '“月_用户_MAU”直接派生“日_用户_DAU日均”', newValue: '“月_用户_MAU”乘以“月_活跃率”系数派生“日_用户_DAU日均”', operator: '运营部-陈七' },
    ],
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

const DEPARTMENTS = ['财务部', '市场部', '网络部', '客服部']

function makeAiRec(
  index: number,
  sourceName: string,
  targetName: string,
  relationTypeName: string,
  confidence: number,
): AiRecommendation {
  const idx = String(index).padStart(2, '0')
  return {
    id: 'ai-rec-' + idx,
    sourceIndicatorId: 'ind-src-' + idx,
    sourceIndicatorName: sourceName,
    sourceDepartment: DEPARTMENTS[index % DEPARTMENTS.length],
    targetIndicatorId: 'ind-tgt-' + idx,
    targetIndicatorName: targetName,
    targetDepartment: DEPARTMENTS[(index + 1) % DEPARTMENTS.length],
    relationTypeId: 'LKT-00' + ((index % 7) + 1),
    relationTypeName,
    confidence,
    reason: sourceName + ' 与 ' + targetName + ' 在历史数据中呈现强' + relationTypeName + '模式',
  }
}

export const mockAiRecommendations: AiRecommendation[] = [
  makeAiRec(1, '5G用户渗透率', '移动用户总数', '依赖关系', 0.95),
  makeAiRec(2, '5G用户渗透率', '5G基站数', '因果关系', 0.92),
  makeAiRec(3, '营收完成率', 'ARPU值', '聚合关系', 0.88),
  makeAiRec(4, '营收完成率', '客户满意度', '相关关系', 0.75),
  makeAiRec(5, '客户满意度', '投诉处理时长', '因果关系', 0.91),
  makeAiRec(6, '网络可用率', '故障修复时长', '因果关系', 0.89),
  makeAiRec(7, '网络可用率', '设备在线率', '聚合关系', 0.85),
  makeAiRec(8, '月活跃用户数', '日活跃用户数', '衍生关系', 0.97),
  makeAiRec(9, '月活跃用户数', '新增用户数', '聚合关系', 0.82),
  makeAiRec(10, '用户留存率', '用户满意度评分', '相关关系', 0.72),
  makeAiRec(11, '用户留存率', '月活跃用户数', '依赖关系', 0.86),
  makeAiRec(12, '带宽利用率', '流量峰值', '聚合关系', 0.94),
  makeAiRec(13, '带宽利用率', '用户体验评分', '相关关系', 0.68),
  makeAiRec(14, '工单处理量', '服务人员数', '因果关系', 0.79),
  makeAiRec(15, '工单处理量', '平均响应时间', '依赖关系', 0.83),
  makeAiRec(16, '新增用户数', '市场营销投入', '因果关系', 0.76),
  makeAiRec(17, '新增用户数', '渠道转化率', '聚合关系', 0.87),
  makeAiRec(18, '基站负载率', '连接用户数', '衍生关系', 0.93),
  makeAiRec(19, '基站负载率', '数据流量', '依赖关系', 0.90),
  makeAiRec(20, '数据流量', '视频流量占比', '聚合关系', 0.84),
  makeAiRec(21, '数据流量', '平均下载速率', '相关关系', 0.65),
  makeAiRec(22, '呼叫成功率', '无线接通率', '依赖关系', 0.96),
  makeAiRec(23, '呼叫成功率', '掉线率', '相关关系', 0.71),
  makeAiRec(24, '切换成功率', '移动速度', '因果关系', 0.78),
  makeAiRec(25, '切换成功率', '基站间距', '依赖关系', 0.81),
  makeAiRec(26, 'ARPU值', '套餐升级率', '因果关系', 0.85),
  makeAiRec(27, 'ARPU值', '退订率', '相关关系', 0.55),
  makeAiRec(28, '投诉处理时长', '一线坐席数', '因果关系', 0.74),
  makeAiRec(29, '网络覆盖率', '人口密度', '聚合关系', 0.80),
  makeAiRec(30, '网络覆盖率', '基站密度', '衍生关系', 0.98),
  makeAiRec(31, '包月用户占比', '套餐类型分布', '相关关系', 0.67),
  makeAiRec(32, '设备故障率', '设备使用年限', '因果关系', 0.88),
]