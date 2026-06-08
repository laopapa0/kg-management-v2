import type { ReportPlan } from '@/models/reportModel'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-reports'

export function getReportPlans(): ReportPlan[] {
  return readFromStorage<ReportPlan[]>(KEY, [])
}

export function saveReportPlans(data: ReportPlan[]): void {
  writeToStorage(KEY, data)
}

export function __resetReportStorageCache(): void {
  __resetMemoryCache()
}
