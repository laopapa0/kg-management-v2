/**
 * 生成的报告模型
 *
 * GeneratedReport 代表一次报告生成的结果：
 * - 关联的报告计划
 * - 使用的模板
 * - 筛选范围配置快照
 * - 版本号与生成时间
 */

export interface ReportVersionSnapshot {
  version: string
  generatedAt: string
  sections: GeneratedReportSection[]
  triggerType: 'manual' | 'auto'
}

export interface GeneratedReport {
  id: string
  planId: string
  planName: string
  title?: string
  createdAt?: string
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
  previousVersions?: ReportVersionSnapshot[]
}

export interface GeneratedReportSection {
  id: string
  title: string
  content: string
}

function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** 生成带时间戳的报告标题 */
export function makeReportTitle(planName: string, date = new Date()): string {
  const ts = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${planName}-${ts}`
}

export function createGeneratedReport(
  data: Omit<GeneratedReport, 'id' | 'generatedAt' | 'title'> & { title?: string },
): GeneratedReport {
  return {
    id: generateId(),
    generatedAt: new Date().toISOString(),
    title: data.title ?? makeReportTitle(data.planName),
    ...data,
  }
}

/**
 * 计算下一个版本号
 * 支持两种格式：
 * - v{integer} → v1, v2, v3... (从 latestVersion 整数递增)
 * - v{major}.{minor} → v0.1, v0.2... (minor 递增)
 */
export function getNextVersion(currentVersion: string): string {
  // 优先匹配 v{integer} 格式（如 v1, v12）
  const intMatch = currentVersion.match(/^v(\d+)$/)
  if (intMatch) {
    const num = parseInt(intMatch[1], 10)
    return `v${num + 1}`
  }
  // 匹配 v{major}.{minor} 格式（如 v0.1）
  const dotMatch = currentVersion.match(/^v(\d+)\.(\d+)$/)
  if (dotMatch) {
    const major = parseInt(dotMatch[1], 10)
    const minor = parseInt(dotMatch[2], 10)
    return `v${major}.${minor + 1}`
  }
  return 'v1'
}
