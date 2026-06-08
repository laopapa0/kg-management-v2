import type { GeneratedReport } from '@/models/generatedReportModel'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-generated-reports'

export function getGeneratedReports(): GeneratedReport[] {
  return readFromStorage<GeneratedReport[]>(KEY, [])
}

export function saveGeneratedReports(data: GeneratedReport[]): void {
  writeToStorage(KEY, data)
}

export function addGeneratedReport(report: GeneratedReport): void {
  const existing = getGeneratedReports()
  saveGeneratedReports([...existing, report])
}

export function __resetGeneratedReportStorageCache(): void {
  __resetMemoryCache()
}
