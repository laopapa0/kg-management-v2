const memoryCache = new Map<string, unknown>()

export function readFromStorage<T>(key: string, defaultValue: T): T {
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

export function writeToStorage<T>(key: string, data: T): void {
  memoryCache.set(key, data)
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

export function __resetMemoryCache(): void {
  memoryCache.clear()
}
