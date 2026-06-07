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

/** 单个 key 的历史记录项 */
interface HistoryEntry<T> {
  timestamp: number;
  value: T;
}

/** 每个 key 最多保留的 undo 深度 */
const MAX_UNDO_DEPTH = 20;

// ─── 内存降级缓存 ───
const memoryCache = new Map<string, unknown>();

/** key → 历史栈 */
const undoHistory = new Map<string, HistoryEntry<unknown>[]>();

/**
 * 重置内存缓存（主要用于测试隔离）
 * @internal
 */
export function __resetAttachmentStorageCache(): void {
  memoryCache.clear();
  undoHistory.clear();
}

function clone<T>(value: T): T {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
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

function pushHistory<T>(key: string, value: T): void {
  const stack = undoHistory.get(key) ?? [];
  stack.push({ timestamp: Date.now(), value: clone(value) });
  if (stack.length > MAX_UNDO_DEPTH) {
    stack.shift();
  }
  undoHistory.set(key, stack);
}

/**
 * 判断指定 key 是否存在可撤销的历史记录
 */
export function canUndo(key: string): boolean {
  const stack = undoHistory.get(key);
  return Array.isArray(stack) && stack.length > 0;
}

/**
 * 撤销最近一次对指定 key 的写入操作
 * @returns 撤销后的值；若无可撤销记录则返回 defaultValue
 */
export function undo<T>(key: string, defaultValue: T): T {
  const stack = undoHistory.get(key);
  if (!stack || stack.length === 0) {
    return defaultValue;
  }
  const entry = stack.pop();
  if (stack.length === 0) {
    undoHistory.delete(key);
  }
  if (!entry) {
    return defaultValue;
  }
  writeToStorage(key, entry.value as T);
  return entry.value as T;
}

// ─── Departments ───

export function getDepartments(): Department[] {
  return readFromStorage<Department[]>(KEYS.departments, []);
}

export function saveDepartments(data: Department[]): StorageResult {
  pushHistory(KEYS.departments, getDepartments());
  return writeToStorage(KEYS.departments, data);
}

// ─── Indicators（按部门隔离）───

export function getIndicators(departmentId: string): IndicatorAttachment[] {
  return readFromStorage<IndicatorAttachment[]>(KEYS.indicators(departmentId), []);
}

export function saveIndicators(departmentId: string, data: IndicatorAttachment[]): StorageResult {
  const key = KEYS.indicators(departmentId);
  pushHistory(key, getIndicators(departmentId));
  return writeToStorage(key, data);
}

// ─── TagNodes（按部门隔离）───

export function getTagNodes(departmentId: string): TagNode[] {
  return readFromStorage<TagNode[]>(KEYS.tagNodes(departmentId), []);
}

export function saveTagNodes(departmentId: string, data: TagNode[]): StorageResult {
  const key = KEYS.tagNodes(departmentId);
  pushHistory(key, getTagNodes(departmentId));
  return writeToStorage(key, data);
}

// ─── Rules（全局）───

export function getRules(): Rule[] {
  return readFromStorage<Rule[]>(KEYS.rules, []);
}

export function saveRules(data: Rule[]): StorageResult {
  pushHistory(KEYS.rules, getRules());
  return writeToStorage(KEYS.rules, data);
}

// ─── RuleParameters（全局）───

export function getRuleParameters(): RuleParameter[] {
  return readFromStorage<RuleParameter[]>(KEYS.ruleParameters, []);
}

export function saveRuleParameters(data: RuleParameter[]): StorageResult {
  pushHistory(KEYS.ruleParameters, getRuleParameters());
  return writeToStorage(KEYS.ruleParameters, data);
}

// ─── UI State ───

export function getUiState(): AttachmentUiState {
  return readFromStorage<AttachmentUiState>(KEYS.uiState, {});
}

export function saveUiState(data: AttachmentUiState): StorageResult {
  pushHistory(KEYS.uiState, getUiState());
  return writeToStorage(KEYS.uiState, data);
}
