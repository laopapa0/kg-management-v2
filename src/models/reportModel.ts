import type { FilterScopeValue } from '@/components/report/FilterScopeSelector'

/**
 * 报告计划模型
 *
 * ReportPlan 代表一个定时生成报告的配置，包含：
 * - 基本信息（名称、描述）
 * - 执行周期（每日/每周/每月）
 * - 筛选条件摘要
 * - 版本追踪（最新版本号、最近生成时间）
 */
export interface ReportPlan {
  id: string
  name: string
  schedule: 'daily' | 'weekly' | 'monthly'
  description: string
  filterSummary: string
  latestVersion: number
  lastGeneratedAt?: string
  autoSchedule?: boolean
  nextRunAt?: string
  createdAt: string
  /** 计划绑定的筛选范围 */
  filterScope?: FilterScopeValue
  /** 绑定的模板 ID */
  templateId?: string
  /** 是否启用发散分析 */
  divergenceEnabled?: boolean
  /** 发散分析提示词 */
  divergencePrompt?: string
}

/** 执行周期中文映射 */
export const SCHEDULE_LABELS: Record<ReportPlan['schedule'], string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
}

function generateId(): string {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 创建新的 ReportPlan，自动填充 id 和 createdAt
 */
export function createReportPlan(
  data: Omit<ReportPlan, 'id' | 'createdAt' | 'latestVersion'>,
): ReportPlan {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    latestVersion: 0,
    ...data,
  }
}

/** Mock 报告计划数据 */
export const mockReportPlans: ReportPlan[] = [
  {
    id: 'report-plan-001',
    name: '核心指标日报',
    schedule: 'daily',
    description: '每日自动生成核心指标监控报告',
    filterSummary: '核心指标 / 全部部门',
    latestVersion: 3,
    lastGeneratedAt: '2026-06-10T08:00:00.000Z',
    createdAt: '2026-05-01T00:00:00.000Z',
    filterScope: {
      includedIndicatorIds: ['ind-001', 'ind-002'],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    templateId: 'tmpl-001',
  },
  {
    id: 'report-plan-002',
    name: '周报汇总',
    schedule: 'weekly',
    description: '每周一自动生成上周汇总报告',
    filterSummary: '全部指标 / 市场部',
    latestVersion: 2,
    lastGeneratedAt: '2026-06-02T08:00:00.000Z',
    createdAt: '2026-05-10T00:00:00.000Z',
    filterScope: {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    templateId: 'tmpl-002',
  },
  {
    id: 'report-plan-003',
    name: '月度经营分析',
    schedule: 'monthly',
    description: '每月初生成上月经营分析报告',
    filterSummary: '经营类指标 / 全部部门',
    latestVersion: 1,
    lastGeneratedAt: '2026-06-01T08:00:00.000Z',
    createdAt: '2026-05-15T00:00:00.000Z',
    filterScope: {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    templateId: 'tmpl-002',
  },
]
