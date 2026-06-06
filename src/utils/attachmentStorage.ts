import type { IndicatorAttachment, Rule, RuleParameter, TagNode } from '@/models/indicatorAttachmentModel';

/** localStorage key 前缀（与 v1 的 kg- 区分） */
export const KEY_PREFIX = 'kgv2-attachment-';

const KEYS = {
  departments: `${KEY_PREFIX}departments`,
  indicators: (departmentId: string) => `${KEY_PREFIX}indicators-${departmentId}`,
  tagNodes: (departmentId: string) => `${KEY_PREFIX}tagnodes-${departmentId}`,
  rules: `${KEY_PREFIX}rules`,
  ruleParameters: `${KEY_PREFIX}rule-params`,
  uiState: `${KEY_PREFIX}ui`,
} as const;

/** 存储操作结果 */
export interface StorageResult {
  success: boolean;
  error?: string;
}

/** 部门 */
export interface Department {
  id: string;
  name: string;
}

/** 页面 UI 状态 */
export interface AttachmentUiState {
  selectedDepartmentId?: string;
  expandedTreeNodeIds?: string[];
  expandedTagNodeIds?: string[];
  selectedIndicatorIds?: string[];
}

// ─── 内存降级缓存 ───
const memoryCache = new Map<string, unknown>();

/**
 * 重置内存缓存（主要用于测试隔离）
 * @internal
 */
export function __resetAttachmentStorageCache(): void {
  memoryCache.clear();
}

function readFromStorage<T>(key: string, defaultValue: T): T {
  // 优先内存缓存：它可能包含最近一次写入失败但用户期望保留的最新数据
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as T;
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // JSON 解析失败时静默丢弃，返回默认值
  }

  return defaultValue;
}

function writeToStorage<T>(key: string, data: T): StorageResult {
  // 始终更新内存缓存，确保即使 localStorage 失败也能读回
  memoryCache.set(key, data);

  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// ─── Departments ───

export function getDepartments(): Department[] {
  return readFromStorage<Department[]>(KEYS.departments, []);
}

export function saveDepartments(data: Department[]): StorageResult {
  return writeToStorage(KEYS.departments, data);
}

// ─── Indicators（按部门隔离）───

export function getIndicators(departmentId: string): IndicatorAttachment[] {
  return readFromStorage<IndicatorAttachment[]>(KEYS.indicators(departmentId), []);
}

export function saveIndicators(departmentId: string, data: IndicatorAttachment[]): StorageResult {
  return writeToStorage(KEYS.indicators(departmentId), data);
}

// ─── TagNodes（按部门隔离）───

export function getTagNodes(departmentId: string): TagNode[] {
  return readFromStorage<TagNode[]>(KEYS.tagNodes(departmentId), []);
}

export function saveTagNodes(departmentId: string, data: TagNode[]): StorageResult {
  return writeToStorage(KEYS.tagNodes(departmentId), data);
}

// ─── Rules（全局）───

export function getRules(): Rule[] {
  return readFromStorage<Rule[]>(KEYS.rules, []);
}

export function saveRules(data: Rule[]): StorageResult {
  return writeToStorage(KEYS.rules, data);
}

// ─── RuleParameters（全局）───

export function getRuleParameters(): RuleParameter[] {
  return readFromStorage<RuleParameter[]>(KEYS.ruleParameters, []);
}

export function saveRuleParameters(data: RuleParameter[]): StorageResult {
  return writeToStorage(KEYS.ruleParameters, data);
}

// ─── UI State ───

export function getUiState(): AttachmentUiState {
  return readFromStorage<AttachmentUiState>(KEYS.uiState, {});
}

export function saveUiState(data: AttachmentUiState): StorageResult {
  return writeToStorage(KEYS.uiState, data);
}
