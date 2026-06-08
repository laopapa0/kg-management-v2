import type { ReportTemplate } from '@/models/reportTemplateModel'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-report-templates'

export function getReportTemplates(): ReportTemplate[] {
  return readFromStorage<ReportTemplate[]>(KEY, [])
}

export function saveReportTemplates(data: ReportTemplate[]): void {
  writeToStorage(KEY, data)
}

export function __resetReportTemplateStorageCache(): void {
  __resetMemoryCache()
}
