import type { ReportPlan } from '@/models/reportModel'

const KEY = 'kgv2-reports'

const memoryCache = new Map<string, unknown>()

function readFromStorage<T>(key: string, defaultValue: T): T {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T
  }
  try {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      const parsed = JSON.parse(raw) as T
      memoryCache.set(key, parsed)
      return parsed
    }
  } catch {
    // ignore
  }
  return defaultValue
}

function writeToStorage<T>(key: string, data: T): void {
  memoryCache.set(key, data)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function getReportPlans(): ReportPlan[] {
  return readFromStorage<ReportPlan[]>(KEY, [])
}

export function saveReportPlans(data: ReportPlan[]): void {
  writeToStorage(KEY, data)
}

/**
 * 重置内存缓存（主要用于测试隔离）
 * @internal
 */
export function __resetReportStorageCache(): void {
  memoryCache.clear()
}
