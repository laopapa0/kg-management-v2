import type { GeneratedReport, GeneratedReportSection } from '@/models/generatedReportModel'

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
]

export function generateMockReport(planName: string, templateName: string): GeneratedReport {
  return {
    id: `gen-mock-${Date.now()}`,
    planId: 'plan-mock',
    planName,
    templateId: 'tmpl-mock',
    templateName,
    version: 'v0.1',
    generatedAt: new Date().toISOString(),
    filterScope: {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    },
    sections: MOCK_REPORT_SECTIONS,
  }
}
