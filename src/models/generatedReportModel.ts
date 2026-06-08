/**
 * 生成的报告模型
 *
 * GeneratedReport 代表一次报告生成的结果：
 * - 关联的报告计划
 * - 使用的模板
 * - 筛选范围配置快照
 * - 版本号与生成时间
 */

export interface GeneratedReport {
  id: string
  planId: string
  planName: string
  templateId: string
  templateName: string
  version: string
  generatedAt: string
  filterScope: {
    includedIndicatorIds: string[]
    excludedRuleIds: string[]
    excludedLinkRelationIds: string[]
  }
  sections: GeneratedReportSection[]
}

export interface GeneratedReportSection {
  id: string
  title: string
  content: string
}

function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createGeneratedReport(
  data: Omit<GeneratedReport, 'id' | 'generatedAt'>,
): GeneratedReport {
  return {
    id: generateId(),
    generatedAt: new Date().toISOString(),
    ...data,
  }
}
