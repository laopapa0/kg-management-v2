import type { ReportPlan } from '@/models/reportModel'
import { mockReportPlans } from '@/models/reportModel'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-reports'

export function getReportPlans(): ReportPlan[] {
  const existing = readFromStorage<ReportPlan[]>(KEY, [])
  if (existing.length === 0) {
    writeToStorage(KEY, mockReportPlans)
    return mockReportPlans
  }
  return existing
}

export function saveReportPlans(data: ReportPlan[]): void {
  writeToStorage(KEY, data)
}

export function __resetReportStorageCache(): void {
  __resetMemoryCache()
}
