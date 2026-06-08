export interface LinkRelation {
  id: string
  name: string
  description: string
  enabled: boolean
  usageCount: number
  sourceType: string
  targetType: string
  createdAt: string
}

/** 关系类型在某条连线上的使用记录 */
export interface LinkUsageConnection {
  sourceName: string
  targetName: string
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
    id: '1',
    name: 'AGGREGATES',
    description: '聚合关系：子指标汇总为父指标',
    enabled: true,
    usageCount: 12,
    sourceType: 'Indicator',
    targetType: 'Indicator',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'DEPENDS_ON',
    description: '依赖关系：指标依赖于上游指标',
    enabled: true,
    usageCount: 34,
    sourceType: 'Indicator',
    targetType: 'Indicator',
    createdAt: '2026-01-20',
  },
  {
    id: '3',
    name: 'DRIVES',
    description: '驱动关系：指标驱动下游业务',
    enabled: false,
    usageCount: 8,
    sourceType: 'Indicator',
    targetType: 'Business',
    createdAt: '2026-02-01',
  },
  {
    id: '4',
    name: 'TRANSMISSION',
    description: '传导关系：异常在指标间传导',
    enabled: true,
    usageCount: 21,
    sourceType: 'Indicator',
    targetType: 'Indicator',
    createdAt: '2026-02-10',
  },
  {
    id: '5',
    name: 'CORRELATES',
    description: '相关关系：指标间存在统计相关性',
    enabled: false,
    usageCount: 5,
    sourceType: 'Indicator',
    targetType: 'Indicator',
    createdAt: '2026-03-01',
  },
  {
    id: '6',
    name: 'INFLUENCES',
    description: '影响关系：外部因素对指标的影响',
    enabled: true,
    usageCount: 17,
    sourceType: 'Factor',
    targetType: 'Indicator',
    createdAt: '2026-03-15',
  },
  {
    id: '7',
    name: 'DERIVES',
    description: '派生关系：指标由其他指标计算得出',
    enabled: true,
    usageCount: 29,
    sourceType: 'Indicator',
    targetType: 'Indicator',
    createdAt: '2026-04-01',
  },
]

// ─── 使用追踪 mock ───
export const mockLinkUsages: LinkUsage[] = [
  {
    relationId: '1',
    connectionCount: 3,
    connections: [
      { sourceName: '月_收入_总收入', targetName: '季_收入_总收入' },
      { sourceName: '日_用户_新增用户', targetName: '月_用户_新增用户' },
      { sourceName: '月_成本_运营成本', targetName: '季_成本_总成本' },
    ],
  },
  {
    relationId: '2',
    connectionCount: 5,
    connections: [
      { sourceName: '月_收入_主营业务收入', targetName: '月_收入_总收入' },
      { sourceName: '日_网络_基站数', targetName: '月_网络_覆盖率' },
      { sourceName: '月_用户_活跃用户', targetName: '月_用户_留存率' },
      { sourceName: '周_服务_投诉量', targetName: '月_服务_满意度' },
      { sourceName: '月_交付_订单量', targetName: '月_交付_交付率' },
    ],
  },
  {
    relationId: '3',
    connectionCount: 2,
    connections: [
      { sourceName: '月_收入_总收入', targetName: '经营分析大屏' },
      { sourceName: '月_用户_新增用户', targetName: '用户增长看板' },
    ],
  },
  {
    relationId: '4',
    connectionCount: 4,
    connections: [
      { sourceName: '月_网络_延迟', targetName: '月_网络_丢包率' },
      { sourceName: '月_网络_丢包率', targetName: '月_服务_投诉量' },
      { sourceName: '日_成本_能耗', targetName: '月_成本_运营成本' },
      { sourceName: '月_交付_交付率', targetName: '月_收入_客户收入' },
    ],
  },
  {
    relationId: '5',
    connectionCount: 1,
    connections: [
      { sourceName: '月_用户_活跃用户', targetName: '月_收入_总收入' },
    ],
  },
  {
    relationId: '6',
    connectionCount: 2,
    connections: [
      { sourceName: '季节性波动', targetName: '月_收入_总收入' },
      { sourceName: '政策调整', targetName: '月_成本_运营成本' },
    ],
  },
  {
    relationId: '7',
    connectionCount: 4,
    connections: [
      { sourceName: '月_收入_A产品收入', targetName: '月_收入_总收入' },
      { sourceName: '月_收入_B产品收入', targetName: '月_收入_总收入' },
      { sourceName: '月_成本_人力成本', targetName: '月_成本_运营成本' },
      { sourceName: '月_成本_物料成本', targetName: '月_成本_运营成本' },
    ],
  },
]

// ─── 变更记录 mock ───
export const mockLinkChangeLogs: LinkChangeLog[] = [
  {
    relationId: '1',
    changes: [
      { timestamp: '2026-01-15 09:30:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
      { timestamp: '2026-02-20 14:15:00', type: '修改', field: 'description', oldValue: '聚合关系', newValue: '聚合关系：子指标汇总为父指标', operator: 'zhangsan' },
    ],
  },
  {
    relationId: '2',
    changes: [
      { timestamp: '2026-01-20 10:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
      { timestamp: '2026-03-05 11:20:00', type: '停用', field: 'enabled', oldValue: 'true', newValue: 'false', operator: 'lisi' },
      { timestamp: '2026-03-10 16:45:00', type: '启用', field: 'enabled', oldValue: 'false', newValue: 'true', operator: 'wangwu' },
    ],
  },
  {
    relationId: '3',
    changes: [
      { timestamp: '2026-02-01 08:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
      { timestamp: '2026-04-12 09:10:00', type: '停用', field: 'enabled', oldValue: 'true', newValue: 'false', operator: 'zhangsan' },
    ],
  },
  {
    relationId: '4',
    changes: [
      { timestamp: '2026-02-10 13:30:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
    ],
  },
  {
    relationId: '5',
    changes: [
      { timestamp: '2026-03-01 09:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
      { timestamp: '2026-05-15 10:30:00', type: '停用', field: 'enabled', oldValue: 'true', newValue: 'false', operator: 'lisi' },
    ],
  },
  {
    relationId: '6',
    changes: [
      { timestamp: '2026-03-15 11:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
      { timestamp: '2026-04-20 15:20:00', type: '修改', field: 'sourceType', oldValue: 'Indicator', newValue: 'Factor', operator: 'wangwu' },
    ],
  },
  {
    relationId: '7',
    changes: [
      { timestamp: '2026-04-01 10:00:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
      { timestamp: '2026-05-01 14:00:00', type: '修改', field: 'description', oldValue: '派生关系', newValue: '派生关系：指标由其他指标计算得出', operator: 'zhangsan' },
    ],
  },
]
