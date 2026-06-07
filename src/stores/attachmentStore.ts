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

export interface AttachmentState {
  departments: Department[]
  currentDepartmentId: string | null
  indicators: IndicatorAttachment[]
  tagNodes: TagNode[]
  rules: Rule[]
  ruleParameters: RuleParameter[]
  connectionMode: boolean
  uiState: AttachmentUiState

  setCurrentDepartmentId: (id: string | null) => void
  loadDepartmentData: (departmentId: string) => void
  setIndicators: (data: IndicatorAttachment[]) => void
  setTagNodes: (data: TagNode[]) => void
  setRules: (data: Rule[]) => void
  setRuleParameters: (data: RuleParameter[]) => void
  setConnectionMode: (mode: boolean) => void
  setUiState: (ui: AttachmentUiState) => void
  init: () => void
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
}

export const useAttachmentStore = create<AttachmentState>((set, get) => ({
  ...initialState,

  init: () => {
    if (!hasStoredData()) {
      injectMockData()
    }
    set(loadAllFromStorage())
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

  setIndicators: (data) => {
    set({ indicators: data })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveIndicators(deptId, data)
    }
  },

  setTagNodes: (data) => {
    set({ tagNodes: data })
    const deptId = get().currentDepartmentId
    if (deptId) {
      saveTagNodes(deptId, data)
    }
  },

  setRules: (data) => {
    set({ rules: data })
    saveRules(data)
  },

  setRuleParameters: (data) => {
    set({ ruleParameters: data })
    saveRuleParameters(data)
  },

  setConnectionMode: (mode) => {
    set({ connectionMode: mode })
  },

  setUiState: (ui) => {
    set({ uiState: ui })
    saveUiState(ui)
  },
}))

// Expose initial state helper for test resets
Object.defineProperty(useAttachmentStore, 'getInitialState', {
  value: () => ({ ...initialState }),
})

export function initializeAttachmentStore(): void {
  useAttachmentStore.getState().init()
}
