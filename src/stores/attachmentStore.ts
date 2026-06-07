import { create } from 'zustand'
import type { IndicatorAttachment, TagNode, Rule, RuleParameter } from '@/models/indicatorAttachmentModel'
import { createMinimalIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import type { Department, AttachmentUiState } from '@/utils/attachmentStorage'
import {
  getDepartments,
  saveDepartments,
  getIndicators,
  saveIndicators,
  getTagNodes,
  saveTagNodes,
  getRules,
  saveRules,
  getRuleParameters,
  saveRuleParameters,
  getUiState,
  saveUiState,
} from '@/utils/attachmentStorage'
import {
  mockDepartments,
  generateMockIndicators,
  generateMockTagNodes,
  generateMockRules,
  generateMockRuleParameters,
  generateMockUiState,
} from '@/data/mockAttachmentData'

const MAX_HISTORY_SIZE = 50

export interface DataSnapshot {
  indicators: IndicatorAttachment[]
  tagNodes: TagNode[]
  rules: Rule[]
  ruleParameters: RuleParameter[]
}

export interface AttachmentState {
  departments: Department[]
  currentDepartmentId: string | null
  indicators: IndicatorAttachment[]
  tagNodes: TagNode[]
  rules: Rule[]
  ruleParameters: RuleParameter[]
  connectionMode: boolean
  uiState: AttachmentUiState
  undoStack: DataSnapshot[]
  redoStack: DataSnapshot[]
  canUndo: boolean
  canRedo: boolean

  setCurrentDepartmentId: (id: string | null) => void
  loadDepartmentData: (departmentId: string) => void
  setIndicators: (data: IndicatorAttachment[]) => void
  setTagNodes: (data: TagNode[]) => void
  setRules: (data: Rule[]) => void
  setRuleParameters: (data: RuleParameter[]) => void
  setConnectionMode: (mode: boolean) => void
  setUiState: (ui: AttachmentUiState) => void
  pushHistory: () => void
  undo: () => void
  redo: () => void
  handleKeyDown: (event: KeyboardEvent) => void
  init: () => void
  addIndicator: (name: string, parentId?: string) => IndicatorAttachment
  renameIndicator: (id: string, name: string) => void
  deleteIndicator: (id: string) => void
  deleteIndicatorTree: (id: string) => void
}

function createSnapshot(state: Pick<AttachmentState, 'indicators' | 'tagNodes' | 'rules' | 'ruleParameters'>): DataSnapshot {
  // 浅拷贝快照：数组复制，元素引用共享。
  // 当前所有 mutation 遵循 immutable pattern（生成新数组），浅拷贝已足够。
  // 若未来引入 mutate-in-place 操作，需升级为 structuredClone。
  return {
    indicators: [...state.indicators],
    tagNodes: [...state.tagNodes],
    rules: [...state.rules],
    ruleParameters: [...state.ruleParameters],
  }
}

const CLEAR_REDO = { redoStack: [] as DataSnapshot[], canRedo: false } as const

function hasStoredData(): boolean {
  return getDepartments().length > 0
}

function injectMockData(): void {
  saveDepartments(mockDepartments)
  mockDepartments.forEach((dept) => {
    saveIndicators(dept.id, generateMockIndicators(dept.id))
    saveTagNodes(dept.id, generateMockTagNodes(dept.id))
  })
  saveRules(generateMockRules())
  saveRuleParameters(generateMockRuleParameters())
  saveUiState(generateMockUiState())
}

function loadAllFromStorage(): Pick<
  AttachmentState,
  | 'departments'
  | 'currentDepartmentId'
  | 'indicators'
  | 'tagNodes'
  | 'rules'
  | 'ruleParameters'
  | 'uiState'
> {
  const departments = getDepartments()
  const uiState = getUiState()
  const currentDepartmentId = uiState.selectedDepartmentId ?? (departments[0]?.id ?? null)

  return {
    departments,
    currentDepartmentId,
    indicators: currentDepartmentId ? getIndicators(currentDepartmentId) : [],
    tagNodes: currentDepartmentId ? getTagNodes(currentDepartmentId) : [],
    rules: getRules(),
    ruleParameters: getRuleParameters(),
    uiState,
  }
}

const initialState: Omit<
  AttachmentState,
  | 'setCurrentDepartmentId'
  | 'loadDepartmentData'
  | 'setIndicators'
  | 'setTagNodes'
  | 'setRules'
  | 'setRuleParameters'
  | 'setConnectionMode'
  | 'setUiState'
  | 'pushHistory'
  | 'undo'
  | 'redo'
  | 'handleKeyDown'
  | 'init'
  | 'addIndicator'
  | 'renameIndicator'
  | 'deleteIndicator'
  | 'deleteIndicatorTree'
> = {
  departments: [],
  currentDepartmentId: null,
  indicators: [],
  tagNodes: [],
  rules: [],
  ruleParameters: [],
  connectionMode: false,
  uiState: {},
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
}

export const useAttachmentStore = create<AttachmentState>((set, get) => ({
  ...initialState,

  init: () => {
    if (!hasStoredData()) {
      injectMockData()
    }
    set({ ...loadAllFromStorage(), undoStack: [], redoStack: [], canUndo: false, canRedo: false })
  },

  setCurrentDepartmentId: (id) => {
    set({ currentDepartmentId: id })
    if (id) {
      get().loadDepartmentData(id)
    }
  },

  loadDepartmentData: (departmentId) => {
    set({
      indicators: getIndicators(departmentId),
      tagNodes: getTagNodes(departmentId),
    })
  },

  pushHistory: () => {
    set((state) => {
      const snapshot = createSnapshot(state)
      const nextUndo = [...state.undoStack, snapshot]
      if (nextUndo.length > MAX_HISTORY_SIZE) {
        nextUndo.shift()
      }
      return { undoStack: nextUndo, canUndo: true }
    })
  },

  setIndicators: (data) => {
    get().pushHistory()
    set({ indicators: data, ...CLEAR_REDO })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, data)
    }
  },

  setTagNodes: (data) => {
    get().pushHistory()
    set({ tagNodes: data, ...CLEAR_REDO })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveTagNodes(deptId, data)
    }
  },

  setRules: (data) => {
    get().pushHistory()
    set({ rules: data, ...CLEAR_REDO })
    saveRules(data)
  },

  setRuleParameters: (data) => {
    get().pushHistory()
    set({ ruleParameters: data, ...CLEAR_REDO })
    saveRuleParameters(data)
  },

  setConnectionMode: (mode) => {
    set({ connectionMode: mode })
  },

  setUiState: (ui) => {
    set({ uiState: ui })
    saveUiState(ui)
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return {}
      const current = createSnapshot(state)
      const previous = state.undoStack[state.undoStack.length - 1]
      return {
        ...previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, current],
        canUndo: state.undoStack.length > 1,
        canRedo: true,
      }
    })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, get().indicators)
      saveTagNodes(deptId, get().tagNodes)
    }
    saveRules(get().rules)
    saveRuleParameters(get().ruleParameters)
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return {}
      const current = createSnapshot(state)
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        ...next,
        undoStack: [...state.undoStack, current],
        redoStack: state.redoStack.slice(0, -1),
        canUndo: true,
        canRedo: state.redoStack.length > 1,
      }
    })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, get().indicators)
      saveTagNodes(deptId, get().tagNodes)
    }
    saveRules(get().rules)
    saveRuleParameters(get().ruleParameters)
  },

  handleKeyDown: (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      if (event.shiftKey) {
        get().redo()
      } else {
        get().undo()
      }
    }
  },

  addIndicator: (name, parentId) => {
    get().pushHistory()
    const deptId = get().currentDepartmentId
    const newIndicator = createMinimalIndicatorAttachment(name, {
      parentId,
      department: get().departments.find((d) => d.id === deptId)?.name,
    })
    const next = [...get().indicators, newIndicator]
    set({ indicators: next, ...CLEAR_REDO })
    if (deptId) {
      saveIndicators(deptId, next)
    }
    return newIndicator
  },

  renameIndicator: (id, name) => {
    const exists = get().indicators.find((i) => i.id === id)
    if (!exists) return
    get().pushHistory()
    const next = get().indicators.map((i) => (i.id === id ? { ...i, name } : i))
    set({ indicators: next, ...CLEAR_REDO })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, next)
    }
  },

  deleteIndicator: (id) => {
    const exists = get().indicators.find((i) => i.id === id)
    if (!exists) return
    get().pushHistory()
    const next = get()
      .indicators.filter((i) => i.id !== id)
      .map((i) => (i.treeParentId === id ? { ...i, treeParentId: undefined } : i))
    set({ indicators: next, ...CLEAR_REDO })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, next)
    }
  },

  deleteIndicatorTree: (id) => {
    const exists = get().indicators.find((i) => i.id === id)
    if (!exists) return

    // Collect all descendant IDs recursively
    const idsToDelete = new Set<string>([id])
    const indicators = get().indicators
    let changed = true
    while (changed) {
      changed = false
      for (const i of indicators) {
        if (!idsToDelete.has(i.id) && i.treeParentId && idsToDelete.has(i.treeParentId)) {
          idsToDelete.add(i.id)
          changed = true
        }
      }
    }

    get().pushHistory()
    const next = indicators.filter((i) => !idsToDelete.has(i.id))
    set({ indicators: next, ...CLEAR_REDO })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, next)
    }
  },
}))

// Expose initial state helper for test resets
Object.defineProperty(useAttachmentStore, 'getInitialState', {
  value: () => ({ ...initialState }),
})

export function initializeAttachmentStore(): void {
  useAttachmentStore.getState().init()
}

/** Derived selector: 返回未挂靠到任何树/标签/规则的指标 */
export function selectPendingIndicators(state: AttachmentState): IndicatorAttachment[] {
  return state.indicators.filter(
    (indicator) =>
      !indicator.treeParentId &&
      indicator.tagIds.length === 0 &&
      indicator.ruleIds.length === 0,
  )
}
