import type { GeneratedReport, GeneratedReportSection } from '@/models/generatedReportModel'
import { makeReportTitle } from '@/models/generatedReportModel'
import type { FilterScopeValue } from '@/components/report/FilterScopeSelector'

export const MOCK_REPORT_SECTIONS: GeneratedReportSection[] = [
  {
    id: 'sec-overview',
    title: '指标概览',
    content: '本期共监测 24 项核心指标，其中 18 项处于正常区间，3 项触发异常告警，3 项处于关注区间。整体健康度 87.5%，较上期提升 2.1 个百分点。',
  },
  {
    id: 'sec-abnormal',
    title: '异常检测',
    content: '检测到 3 项指标异常：\n1. 5G用户渗透率（环比-5.2%）\n2. 客户满意度（环比下降 0.8 分）\n3. 网络故障率（超过阈值上限 12%）',
  },
  {
    id: 'sec-trend',
    title: '趋势分析',
    content: '过去 30 天内，收入类指标呈稳步上升趋势（+3.4%），成本类指标波动较小（±1.2%）。用户增长类指标在月中出现小幅回落，月末恢复增长。',
  },
  {
    id: 'sec-attribution',
    title: '归因分析',
    content: '收入提升主要归因于：\n1. 新用户获取成本下降 8%\n2. 高价值用户留存率提升 3.5%\n3. 交叉销售转化率提升至 12.6%',
  },
  {
    id: 'sec-forecast',
    title: '预测与建议',
    content: '基于当前趋势预测，下月核心收入指标将保持 2-4% 增长。建议重点关注：\n1. 5G用户渗透率的持续下滑\n2. 客户满意度的波动\n3. 网络故障率的阈值控制',
  },
  {
    id: 'sec-summary',
    title: '结论摘要',
    content: '本期整体运营状况良好，核心指标健康度 87.5%。需持续关注异常指标，建议下周召开专项复盘会议，针对 5G 用户渗透率和客户满意度制定改进措施。',
  },
]

export function generateMockReport(
  planName: string,
  templateName: string,
  planId?: string,
  templateId?: string,
  filterScope?: FilterScopeValue,
  triggerType: 'manual' | 'auto' = 'manual',
): GeneratedReport {
  const now = new Date()
  return {
    id: `gen-mock-${Date.now()}`,
    planId: planId ?? 'plan-mock',
    planName,
    title: makeReportTitle(planName, now),
    createdAt: now.toISOString(),
    templateId: templateId ?? 'tmpl-mock',
    templateName,
    version: 'v0.1',
    generatedAt: new Date().toISOString(),
    filterScope: filterScope ?? {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType,
    sections: MOCK_REPORT_SECTIONS,
  }
}

/**
 * 预置历史报告：3 个计划共 6 条，手动/自动混合，版本 v1/v2/v3
 */
export const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'gen-report-plan-001-v1',
    planId: 'report-plan-001',
    planName: '核心指标日报',
    title: '核心指标日报-2026/05/20 08:00',
    createdAt: '2026-05-20T08:00:00.000Z',
    templateId: 'tmpl-001',
    templateName: '月报标准模板',
    version: 'v1',
    generatedAt: '2026-05-20T08:00:00.000Z',
    filterScope: {
      includedIndicatorIds: ['ind-001', 'ind-002'],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType: 'auto',
    sections: MOCK_REPORT_SECTIONS,
  },
  {
    id: 'gen-report-plan-001-v2',
    planId: 'report-plan-001',
    planName: '核心指标日报',
    title: '核心指标日报-2026/05/25 14:30',
    createdAt: '2026-05-25T14:30:00.000Z',
    templateId: 'tmpl-001',
    templateName: '月报标准模板',
    version: 'v2',
    generatedAt: '2026-05-25T14:30:00.000Z',
    filterScope: {
      includedIndicatorIds: ['ind-001', 'ind-002'],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType: 'manual',
    sections: MOCK_REPORT_SECTIONS,
  },
  {
    id: 'gen-report-plan-001-v3',
    planId: 'report-plan-001',
    planName: '核心指标日报',
    title: '核心指标日报-2026/06/10 08:00',
    createdAt: '2026-06-10T08:00:00.000Z',
    templateId: 'tmpl-001',
    templateName: '月报标准模板',
    version: 'v3',
    generatedAt: '2026-06-10T08:00:00.000Z',
    filterScope: {
      includedIndicatorIds: ['ind-001', 'ind-002'],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType: 'auto',
    sections: MOCK_REPORT_SECTIONS,
  },
  {
    id: 'gen-report-plan-002-v1',
    planId: 'report-plan-002',
    planName: '周报汇总',
    title: '周报汇总-2026/05/26 08:00',
    createdAt: '2026-05-26T08:00:00.000Z',
    templateId: 'tmpl-002',
    templateName: '周报速览模板',
    version: 'v1',
    generatedAt: '2026-05-26T08:00:00.000Z',
    filterScope: {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType: 'manual',
    sections: MOCK_REPORT_SECTIONS.slice(0, 5),
  },
  {
    id: 'gen-report-plan-002-v2',
    planId: 'report-plan-002',
    planName: '周报汇总',
    title: '周报汇总-2026/06/02 08:00',
    createdAt: '2026-06-02T08:00:00.000Z',
    templateId: 'tmpl-002',
    templateName: '周报速览模板',
    version: 'v2',
    generatedAt: '2026-06-02T08:00:00.000Z',
    filterScope: {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType: 'auto',
    sections: MOCK_REPORT_SECTIONS.slice(0, 5),
  },
  {
    id: 'gen-report-plan-003-v1',
    planId: 'report-plan-003',
    planName: '月度经营分析',
    title: '月度经营分析-2026/06/01 08:00',
    createdAt: '2026-06-01T08:00:00.000Z',
    templateId: 'tmpl-002',
    templateName: '周报速览模板',
    version: 'v1',
    generatedAt: '2026-06-01T08:00:00.000Z',
    filterScope: {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    triggerType: 'manual',
    sections: MOCK_REPORT_SECTIONS,
  },
]
