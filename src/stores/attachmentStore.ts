import { create } from 'zustand'
import type { IndicatorAttachment, TagNode, Rule, RuleParameter } from '@/models/indicatorAttachmentModel'
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
}

function createSnapshot(state: Pick<AttachmentState, 'indicators' | 'tagNodes' | 'rules' | 'ruleParameters'>): DataSnapshot {
  return {
    indicators: clone(state.indicators),
    tagNodes: clone(state.tagNodes),
    rules: clone(state.rules),
    ruleParameters: clone(state.ruleParameters),
  }
}

function clone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

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
    set({ indicators: data, redoStack: [], canRedo: false })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, data)
    }
  },

  setTagNodes: (data) => {
    get().pushHistory()
    set({ tagNodes: data, redoStack: [], canRedo: false })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveTagNodes(deptId, data)
    }
  },

  setRules: (data) => {
    get().pushHistory()
    set({ rules: data, redoStack: [], canRedo: false })
    saveRules(data)
  },

  setRuleParameters: (data) => {
    get().pushHistory()
    set({ ruleParameters: data, redoStack: [], canRedo: false })
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
