import type { ReportTemplate } from '@/models/reportTemplateModel'
import { mockReportTemplates } from '@/models/reportTemplateModel'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-report-templates'

export function getReportTemplates(): ReportTemplate[] {
  const existing = readFromStorage<ReportTemplate[]>(KEY, [])
  if (existing.length === 0) {
    writeToStorage(KEY, mockReportTemplates)
    return mockReportTemplates
  }
  return existing
}

export function saveReportTemplates(data: ReportTemplate[]): void {
  writeToStorage(KEY, data)
}

export function __resetReportTemplateStorageCache(): void {
  __resetMemoryCache()
}
