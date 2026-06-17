import type { GeneratedReport } from '@/models/generatedReportModel'
import { mockGeneratedReports } from '@/data/mockReportData'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-generated-reports'

export function getGeneratedReports(): GeneratedReport[] {
  const existing = readFromStorage<GeneratedReport[]>(KEY, [])
  if (existing.length === 0) {
    writeToStorage(KEY, mockGeneratedReports)
    return mockGeneratedReports
  }
  return existing
}

export function saveGeneratedReports(data: GeneratedReport[]): void {
  writeToStorage(KEY, data)
}

export function addGeneratedReport(report: GeneratedReport): void {
  const existing = getGeneratedReports()
  saveGeneratedReports([...existing, report])
}

export function updateGeneratedReport(id: string, updater: (r: GeneratedReport) => GeneratedReport): void {
  const all = getGeneratedReports()
  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return
  saveGeneratedReports([
    ...all.slice(0, idx),
    updater(all[idx]),
    ...all.slice(idx + 1),
  ])
}

export function getReportsByPlanId(planId: string): GeneratedReport[] {
  return getGeneratedReports()
    .filter((r) => r.planId === planId)
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
}

export function __resetGeneratedReportStorageCache(): void {
  __resetMemoryCache()
}
