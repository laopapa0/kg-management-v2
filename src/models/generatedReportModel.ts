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
  triggerType: 'manual' | 'auto'
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

/**
 * 计算下一个版本号（v0.1 → v0.2 → v0.3）
 */
export function getNextVersion(currentVersion: string): string {
  const match = currentVersion.match(/v(\d+)\.(\d+)/)
  if (!match) return 'v0.1'
  const major = parseInt(match[1], 10)
  const minor = parseInt(match[2], 10)
  return `v${major}.${minor + 1}`
}
