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
