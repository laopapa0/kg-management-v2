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

export function getReportsByPlanId(planId: string): GeneratedReport[] {
  return getGeneratedReports()
    .filter((r) => r.planId === planId)
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
}

export function __resetGeneratedReportStorageCache(): void {
  __resetMemoryCache()
}
