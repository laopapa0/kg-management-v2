import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel';
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
  KEY_PREFIX,
  __resetAttachmentStorageCache,
  canUndo,
  undo,
  type Department,
  type AttachmentUiState,
} from './attachmentStorage';

describe('attachmentStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetAttachmentStorageCache();
  });

  // ─── 前缀隔离 ───
  it('所有 key 使用 kgv2-attachment- 前缀', () => {
    expect(KEY_PREFIX).toBe('kgv2-attachment-');
  });

  it('saveDepartments 写入的 key 包含正确前缀', () => {
    saveDepartments([{ id: 'DEPT-1', name: '财务部' }]);
    const keys = Object.keys(localStorage);
    expect(keys.some((k) => k.startsWith('kgv2-attachment-'))).toBe(true);
    expect(keys.some((k) => k.startsWith('kg-attachment-'))).toBe(false);
  });

  // ─── Departments CRUD ───
  it('首次 getDepartments 返回空数组', () => {
    expect(getDepartments()).toEqual([]);
  });

  it('saveDepartments 后 getDepartments 返回保存值', () => {
    const departments: Department[] = [
      { id: 'dept-finance', name: '财务部' },
      { id: 'dept-market', name: '市场部' },
    ];

    const result = saveDepartments(departments);
    expect(result.success).toBe(true);
    expect(getDepartments()).toEqual(departments);
  });

  // ─── Indicators CRUD（按 departmentId 隔离）───
  it('首次 getIndicators 返回空数组', () => {
    expect(getIndicators('dept-finance')).toEqual([]);
  });

  it('saveIndicators 后 getIndicators 返回保存值', () => {
    const indicators: IndicatorAttachment[] = [
      {
        id: 'IND-1',
        name: '营收',
        code: 'REV-001',
        indicatorCode: 'REV-001',
        indicatorDisplayName: '营收',
        indicatorShowName: '营收',
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: false,
        department: '财务部',
        businessCaliber: '',
        techCaliber: '',
        tags: [],
        tagIds: ['TAG-1'],
        ruleIds: [],
      },
    ];

    saveIndicators('dept-finance', indicators);
    expect(getIndicators('dept-finance')).toEqual(indicators);
  });

  it('不同 departmentId 的 indicators 相互隔离', () => {
    const financeIndicator: IndicatorAttachment = {
      id: 'IND-F',
      name: '财务指标',
      code: 'FIN-001',
      indicatorCode: 'FIN-001',
      indicatorDisplayName: '财务指标',
      indicatorShowName: '财务',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '收入',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: '财务部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      tagIds: [],
      ruleIds: [],
    };

    const marketIndicator: IndicatorAttachment = {
      id: 'IND-M',
      name: '市场指标',
      code: 'MKT-001',
      indicatorCode: 'MKT-001',
      indicatorDisplayName: '市场指标',
      indicatorShowName: '市场',
      indicatorType: '基础指标',
      level1: '发展',
      level2: '用户发展',
      granularity: '省分',
      frequency: '日',
      unit: '户',
      isBigScreen: false,
      department: '市场部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      tagIds: [],
      ruleIds: [],
    };

    saveIndicators('dept-finance', [financeIndicator]);
    saveIndicators('dept-market', [marketIndicator]);

    expect(getIndicators('dept-finance')).toEqual([financeIndicator]);
    expect(getIndicators('dept-market')).toEqual([marketIndicator]);
  });

  // ─── TagNodes CRUD（按 departmentId 隔离）───
  it('首次 getTagNodes 返回空数组', () => {
    expect(getTagNodes('dept-finance')).toEqual([]);
  });

  it('saveTagNodes 后 getTagNodes 返回保存值', () => {
    const tagNodes = [
      { id: 'TAG-1', name: '利润' },
      { id: 'TAG-2', name: '成本', parentId: 'TAG-1' },
    ];

    saveTagNodes('dept-finance', tagNodes);
    expect(getTagNodes('dept-finance')).toEqual(tagNodes);
  });

  it('不同 departmentId 的 tagNodes 相互隔离', () => {
    saveTagNodes('dept-finance', [{ id: 'T-F', name: '财务标签' }]);
    saveTagNodes('dept-market', [{ id: 'T-M', name: '市场标签' }]);

    expect(getTagNodes('dept-finance')).toEqual([{ id: 'T-F', name: '财务标签' }]);
    expect(getTagNodes('dept-market')).toEqual([{ id: 'T-M', name: '市场标签' }]);
  });

  // ─── Rules CRUD ───
  it('首次 getRules 返回空数组', () => {
    expect(getRules()).toEqual([]);
  });

  it('saveRules 后 getRules 返回保存值', () => {
    const rules = [
      { id: 'RULE-1', name: '阈值规则', type: 'threshold' as const },
      { id: 'RULE-2', name: '波动规则', type: 'fluctuation' as const },
    ];

    saveRules(rules);
    expect(getRules()).toEqual(rules);
  });

  // ─── RuleParameters CRUD ───
  it('首次 getRuleParameters 返回空数组', () => {
    expect(getRuleParameters()).toEqual([]);
  });

  it('saveRuleParameters 后 getRuleParameters 返回保存值', () => {
    const params = [
      { ruleId: 'RULE-1', indicatorId: 'IND-1', upperLimit: 120, lowerLimit: 80 },
    ];

    saveRuleParameters(params);
    expect(getRuleParameters()).toEqual(params);
  });

  // ─── UiState CRUD ───
  it('首次 getUiState 返回默认值', () => {
    expect(getUiState()).toEqual({});
  });

  it('saveUiState 后 getUiState 返回保存值', () => {
    const uiState: AttachmentUiState = {
      selectedDepartmentId: 'dept-finance',
      expandedTreeNodeIds: ['TREE-1'],
    };

    saveUiState(uiState);
    expect(getUiState()).toEqual(uiState);
  });

  // ─── 降级行为：localStorage 损坏时返回默认值 ───
  it('localStorage 中数据损坏时 getDepartments 返回空数组', () => {
    localStorage.setItem('kgv2-attachment-departments', 'not-json');
    expect(getDepartments()).toEqual([]);
  });

  it('localStorage 中数据损坏时 getIndicators 返回空数组', () => {
    localStorage.setItem('kgv2-attachment-indicators-dept-finance', 'not-json');
    expect(getIndicators('dept-finance')).toEqual([]);
  });

  // ─── 降级行为：写入失败时返回错误标识并启用内存存储 ───
  it('localStorage 写入失败时 saveDepartments 返回 success=false 并启用内存缓存', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    const departments: Department[] = [{ id: 'dept-1', name: '财务部' }];
    const result = saveDepartments(departments);

    expect(result.success).toBe(false);
    expect(result.error).toContain('QuotaExceededError');
    // 内存降级后仍能读取到数据
    expect(getDepartments()).toEqual(departments);

    setItemSpy.mockRestore();
  });

  it('localStorage 写入失败时 saveIndicators 返回 success=false 并启用内存缓存', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    const indicators: IndicatorAttachment[] = [
      {
        id: 'IND-1',
        name: '营收',
        code: 'REV-001',
        indicatorCode: 'REV-001',
        indicatorDisplayName: '营收',
        indicatorShowName: '营收',
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: false,
        department: '财务部',
        businessCaliber: '',
        techCaliber: '',
        tags: [],
        tagIds: [],
        ruleIds: [],
      },
    ];

    const result = saveIndicators('dept-finance', indicators);

    expect(result.success).toBe(false);
    expect(getIndicators('dept-finance')).toEqual(indicators);

    setItemSpy.mockRestore();
  });

  // ─── 写入成功后再失败，内存缓存不会覆盖已持久化数据 ───
  it('写入失败时不会破坏已持久化的 localStorage 数据', () => {
    const departmentsA: Department[] = [{ id: 'dept-a', name: 'A部' }];
    const departmentsB: Department[] = [{ id: 'dept-b', name: 'B部' }];

    saveDepartments(departmentsA);
    expect(getDepartments()).toEqual(departmentsA);

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    saveDepartments(departmentsB);
    // 写入失败时读取内存缓存（departmentsB）
    expect(getDepartments()).toEqual(departmentsB);

    setItemSpy.mockRestore();
    // 恢复后 localStorage 中仍然是 departmentsA，未被破坏
    const persisted = JSON.parse(localStorage.getItem('kgv2-attachment-departments')!);
    expect(persisted).toEqual(departmentsA);
  });

  // ─── Undo 操作支持 ───
  describe('undo', () => {
    it('首次保存后 canUndo 返回 true', () => {
      expect(canUndo('kgv2-attachment-departments')).toBe(false);
      saveDepartments([{ id: 'dept-1', name: '财务部' }]);
      expect(canUndo('kgv2-attachment-departments')).toBe(true);
    });

    it('undo 可恢复到上一次保存的值', () => {
      const departmentsA: Department[] = [{ id: 'dept-a', name: 'A部' }];
      const departmentsB: Department[] = [{ id: 'dept-b', name: 'B部' }];

      saveDepartments(departmentsA);
      saveDepartments(departmentsB);
      expect(getDepartments()).toEqual(departmentsB);

      const restored = undo<Department[]>('kgv2-attachment-departments', []);
      expect(restored).toEqual(departmentsA);
      expect(getDepartments()).toEqual(departmentsA);
      // 还有一次 save [] → [a] 的历史可撤销
      expect(canUndo('kgv2-attachment-departments')).toBe(true);

      // 再次 undo 回到初始空数组
      const emptyRestored = undo<Department[]>('kgv2-attachment-departments', []);
      expect(emptyRestored).toEqual([]);
      expect(canUndo('kgv2-attachment-departments')).toBe(false);
    });

    it('undo 无可撤销记录时返回 defaultValue', () => {
      const fallback: Department[] = [{ id: 'fallback', name: '默认' }];
      expect(canUndo('kgv2-attachment-departments')).toBe(false);
      expect(undo<Department[]>('kgv2-attachment-departments', fallback)).toEqual(fallback);
    });

    it('多次 undo 按 LIFO 顺序恢复历史', () => {
      const a: Department[] = [{ id: 'a', name: 'A' }];
      const b: Department[] = [{ id: 'b', name: 'B' }];
      const c: Department[] = [{ id: 'c', name: 'C' }];

      saveDepartments(a);
      saveDepartments(b);
      saveDepartments(c);

      expect(undo<Department[]>('kgv2-attachment-departments', [])).toEqual(b);
      expect(undo<Department[]>('kgv2-attachment-departments', [])).toEqual(a);
      expect(undo<Department[]>('kgv2-attachment-departments', [])).toEqual([]);
      expect(canUndo('kgv2-attachment-departments')).toBe(false);
    });

    it('undo 支持 indicators 按 departmentId 隔离', () => {
      const financeIndicator: IndicatorAttachment = {
        id: 'IND-F',
        name: '财务指标',
        code: 'FIN-001',
        indicatorCode: 'FIN-001',
        indicatorDisplayName: '财务指标',
        indicatorShowName: '财务',
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: false,
        department: '财务部',
        businessCaliber: '',
        techCaliber: '',
        tags: [],
        tagIds: [],
        ruleIds: [],
      };

      saveIndicators('dept-finance', [financeIndicator]);
      saveIndicators('dept-finance', []);
      expect(getIndicators('dept-finance')).toEqual([]);

      const restored = undo<IndicatorAttachment[]>('kgv2-attachment-indicators-dept-finance', []);
      expect(restored).toEqual([financeIndicator]);
      expect(getIndicators('dept-finance')).toEqual([financeIndicator]);
    });

    it('save 操作会限制 undo 栈最大深度', () => {
      for (let i = 0; i < 25; i += 1) {
        saveDepartments([{ id: `dept-${i}`, name: `部-${i}` }]);
      }

      // 最大深度 20，最旧的 5 条应被丢弃
      for (let i = 0; i < 5; i += 1) {
        undo<Department[]>('kgv2-attachment-departments', []);
      }
      // 第 5 次 undo 应该回到 dept-19，而不是 dept-4
      expect(getDepartments()).toEqual([{ id: 'dept-19', name: '部-19' }]);
    });
  });
});
