import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import type { IndicatorAttachment, Rule, TagNode } from '@/models/indicatorAttachmentModel';
import {
  createAttachmentDB,
  type AttachmentDB,
  type Department,
} from './attachmentIndexedDB';

describe('attachmentIndexedDB', () => {
  let db: AttachmentDB;

  beforeEach(async () => {
    // 每个测试前重置 indexedDB（fake-indexeddb 不支持 drop，但可以通过新实例+版本号规避）
    // 简单做法：每个测试创建新的 DB 实例，使用递增版本号避免 schema 冲突
    db = createAttachmentDB({ dbName: `kg-test-${Date.now()}-${Math.random()}` });
  });

  // ─── 初始化 ───
  it('首次 getDepartments 返回 mock 初始部门数据', async () => {
    const departments = await db.getDepartments();

    expect(departments.length).toBeGreaterThan(0);
    expect(departments.some((d) => d.name === '财务部')).toBe(true);
    expect(departments.some((d) => d.name === '市场部')).toBe(true);
  });

  it('首次 getIndicators 返回对应部门的 mock 初始指标', async () => {
    const financeIndicators = await db.getIndicators('dept-finance');
    expect(financeIndicators.length).toBeGreaterThan(0);
    expect(financeIndicators.every((i) => i.department === '财务部')).toBe(true);

    const marketIndicators = await db.getIndicators('dept-market');
    expect(marketIndicators.length).toBeGreaterThan(0);
    expect(marketIndicators.every((i) => i.department === '市场部')).toBe(true);
  });

  it('首次 getTagNodes 返回对应部门的 mock 初始标签', async () => {
    const financeTags = await db.getTagNodes('dept-finance');
    expect(financeTags.length).toBeGreaterThan(0);

    const marketTags = await db.getTagNodes('dept-market');
    expect(marketTags.length).toBeGreaterThan(0);
  });

  it('首次 getRules 返回 mock 初始规则', async () => {
    const rules = await db.getRules();
    expect(rules.length).toBeGreaterThan(0);
  });

  // ─── Departments CRUD ───
  it('setDepartments 后 getDepartments 返回更新值', async () => {
    const departments: Department[] = [
      { id: 'dept-a', name: 'A部' },
      { id: 'dept-b', name: 'B部' },
    ];

    await db.setDepartments(departments);
    const result = await db.getDepartments();

    expect(result).toEqual(departments);
  });

  // ─── Indicators CRUD（按 departmentId 隔离）───
  it('setIndicators 后 getIndicators 返回保存值', async () => {
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

    await db.setIndicators('dept-finance', indicators);
    const result = await db.getIndicators('dept-finance');

    expect(result).toEqual(indicators);
  });

  it('不同 departmentId 的 indicators 相互隔离', async () => {
    const finance: IndicatorAttachment[] = [
      {
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
      },
    ];

    const market: IndicatorAttachment[] = [
      {
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
      },
    ];

    await db.setIndicators('dept-finance', finance);
    await db.setIndicators('dept-market', market);

    expect(await db.getIndicators('dept-finance')).toEqual(finance);
    expect(await db.getIndicators('dept-market')).toEqual(market);
  });

  // ─── TagNodes CRUD（按 departmentId 隔离）───
  it('setTagNodes 后 getTagNodes 返回保存值', async () => {
    const tags: TagNode[] = [
      { id: 'TAG-1', name: '利润' },
      { id: 'TAG-2', name: '成本', parentId: 'TAG-1' },
    ];

    await db.setTagNodes('dept-finance', tags);
    const result = await db.getTagNodes('dept-finance');

    expect(result).toEqual(tags);
  });

  it('不同 departmentId 的 tagNodes 相互隔离', async () => {
    await db.setTagNodes('dept-finance', [{ id: 'T-F', name: '财务标签' }]);
    await db.setTagNodes('dept-market', [{ id: 'T-M', name: '市场标签' }]);

    expect(await db.getTagNodes('dept-finance')).toEqual([{ id: 'T-F', name: '财务标签' }]);
    expect(await db.getTagNodes('dept-market')).toEqual([{ id: 'T-M', name: '市场标签' }]);
  });

  // ─── Rules CRUD ───
  it('setRules 后 getRules 返回保存值', async () => {
    const rules: Rule[] = [
      { id: 'RULE-1', name: '阈值', type: 'threshold' },
      { id: 'RULE-2', name: '波动', type: 'fluctuation' },
    ];

    await db.setRules(rules);
    const result = await db.getRules();

    expect(result).toEqual(rules);
  });

  // ─── 异步非阻塞 ───
  it('读写操作是异步的', async () => {
    const setPromise = db.setDepartments([{ id: 'dept-async', name: '异步部' }]);
    expect(setPromise).toBeInstanceOf(Promise);

    const getPromise = db.getDepartments();
    expect(getPromise).toBeInstanceOf(Promise);

    await Promise.all([setPromise, getPromise]);
  });

  // ─── 初始化失败降级到内存缓存 ───
  it('indexedDB 不可用时降级到内存缓存', async () => {
    const originalIndexedDB = global.indexedDB;
    // @ts-expect-error 模拟 indexedDB 完全不可用
    global.indexedDB = undefined;

    const fallbackDb = createAttachmentDB();

    const departments = await fallbackDb.getDepartments();
    expect(departments.length).toBeGreaterThan(0);

    await fallbackDb.setDepartments([{ id: 'dept-mem', name: '内存部' }]);
    expect(await fallbackDb.getDepartments()).toEqual([{ id: 'dept-mem', name: '内存部' }]);

    global.indexedDB = originalIndexedDB;
  });
});
