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
  type: string
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
    enabled: false,
    usageCount: 8,
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
    usageCount: 5,
    createdAt: '2026-03-01',
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
      { timestamp: '2026-01-15 09:30:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '财务部-张三' },
      { timestamp: '2026-02-20 14:15:00', type: '修改', field: 'description', oldValue: '聚合关系', newValue: '子指标汇总为父指标', operator: '财务部-张三' },
    ],
  },
  {
    relationId: 'LKT-002',
    changes: [
      { timestamp: '2026-01-20 10:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '市场部-李四' },
      { timestamp: '2026-03-05 11:20:00', type: '停用', field: 'enabled', oldValue: 'true', newValue: 'false', operator: '市场部-李四' },
      { timestamp: '2026-03-10 16:45:00', type: '启用', field: 'enabled', oldValue: 'false', newValue: 'true', operator: '市场部-王五' },
    ],
  },
  {
    relationId: 'LKT-003',
    changes: [
      { timestamp: '2026-02-01 08:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '财务部-张三' },
      { timestamp: '2026-04-12 09:10:00', type: '停用', field: 'enabled', oldValue: 'true', newValue: 'false', operator: '财务部-赵六' },
    ],
  },
  {
    relationId: 'LKT-004',
    changes: [
      { timestamp: '2026-02-10 13:30:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '运营部-陈七' },
    ],
  },
  {
    relationId: 'LKT-005',
    changes: [
      { timestamp: '2026-03-01 09:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '市场部-李四' },
      { timestamp: '2026-05-15 10:30:00', type: '停用', field: 'enabled', oldValue: 'true', newValue: 'false', operator: '市场部-王五' },
    ],
  },
  {
    relationId: 'LKT-006',
    changes: [
      { timestamp: '2026-03-15 11:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '财务部-赵六' },
      { timestamp: '2026-04-20 15:20:00', type: '修改', field: 'sourceTypes', oldValue: '指标', newValue: '指标,外部因素', operator: '财务部-赵六' },
    ],
  },
  {
    relationId: 'LKT-007',
    changes: [
      { timestamp: '2026-04-01 10:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: '运营部-陈七' },
      { timestamp: '2026-05-01 14:00:00', type: '修改', field: 'description', oldValue: '派生关系', newValue: '指标由其他指标计算得出', operator: '运营部-陈七' },
    ],
  },
]
