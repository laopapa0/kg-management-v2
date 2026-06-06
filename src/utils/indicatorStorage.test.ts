import { describe, it, expect, beforeEach } from 'vitest';
import {
  getIndicatorApplications,
  createIndicatorApplication,
  updateIndicatorApplication,
  getIndicatorApplicationById,
} from './indicatorStorage';
import type { IndicatorApplication } from './indicatorStorage';

const APP_KEY = 'kg-indicator-applications';

describe('indicatorStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /* ─── 初始化 ─── */

  it('首次读取时返回预置的 4 条 mock 数据', () => {
    const apps = getIndicatorApplications();
    expect(apps).toHaveLength(4);

    const statuses = apps.map((a) => a.status);
    expect(statuses).toContain('editing');
    expect(statuses).toContain('pending');
    expect(statuses).toContain('approved');
    expect(statuses).toContain('rejected');
  });

  it('重复读取不创建多个 mock 数据', () => {
    getIndicatorApplications();
    getIndicatorApplications();
    const apps = getIndicatorApplications();
    expect(apps).toHaveLength(4);
  });

  it('localStorage 已存在数据时直接读取', () => {
    const existing: IndicatorApplication[] = [
      {
        id: 'app-test',
        name: '测试指标',
        code: 'TEST-001',
        source: '统一数据门户',
        status: 'pending',
        uploader: '测试员',
        submitTime: '2026-06-01T00:00:00.000Z',
        indicatorData: {
          id: 'IND-TEST',
          name: '测试指标',
          code: 'TEST-001',
          indicatorCode: 'TEST-CODE',
          indicatorDisplayName: '测试指标',
          indicatorShowName: '测试',
          indicatorType: '基础指标',
          level1: '经营',
          level2: '收入',
          granularity: '全局',
          frequency: '月',
          unit: '元',
          isBigScreen: true,
          department: '财务部',
          businessCaliber: '测试口径',
          techCaliber: '测试技术口径',
          tags: [],
          source: '统一数据门户',
        },
      },
    ];
    localStorage.setItem(APP_KEY, JSON.stringify(existing));
    const apps = getIndicatorApplications();
    expect(apps).toHaveLength(1);
    expect(apps[0].name).toBe('测试指标');
  });

  it('localStorage 数据损坏时回退到重新初始化', () => {
    localStorage.setItem(APP_KEY, 'not-json');
    const apps = getIndicatorApplications();
    expect(apps).toHaveLength(4);
    expect(apps[0].status).toBe('approved');
  });

  /* ─── 创建 ─── */

  it('创建指标申请时自动生成 id 和 submitTime', () => {
    getIndicatorApplications(); // 初始化 mock
    const newApp = createIndicatorApplication({
      name: '新指标',
      code: 'NEW-001',
      source: '经营管理大屏',
      status: 'editing',
      uploader: '小张',
      indicatorData: {
        id: 'IND-NEW',
        name: '新指标',
        code: 'NEW-001',
        indicatorCode: 'NEW-CODE',
        indicatorDisplayName: '新指标',
        indicatorShowName: '新',
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: true,
        department: '市场部',
        businessCaliber: '新指标业务口径',
        techCaliber: '新指标技术口径',
        tags: [],
        source: '经营管理大屏',
      },
    });

    expect(newApp.id).toBeTruthy();
    expect(newApp.id.startsWith('app-')).toBe(true);
    expect(newApp.submitTime).toBeTruthy();
    expect(new Date(newApp.submitTime).getTime()).toBeLessThanOrEqual(Date.now());

    const apps = getIndicatorApplications();
    expect(apps).toHaveLength(5);
  });

  /* ─── 读取 ─── */

  it('通过 ID 查找指标申请', () => {
    const apps = getIndicatorApplications();
    const found = getIndicatorApplicationById(apps[0].id);
    expect(found).toBeTruthy();
    expect(found?.name).toBe(apps[0].name);
  });

  it('查找不存在的 ID 返回 undefined', () => {
    getIndicatorApplications();
    expect(getIndicatorApplicationById('not-exist')).toBeUndefined();
  });

  /* ─── 更新 ─── */

  it('更新指标申请状态', () => {
    const apps = getIndicatorApplications();
    const target = apps.find((a) => a.status === 'editing')!;

    const updated = updateIndicatorApplication(target.id, {
      status: 'pending',
      name: '已提交指标',
    });

    expect(updated.status).toBe('pending');
    expect(updated.name).toBe('已提交指标');
    expect(updated.id).toBe(target.id);
    expect(updated.code).toBe(target.code); // 未更新的字段保留

    const refreshed = getIndicatorApplications();
    const found = refreshed.find((a) => a.id === target.id);
    expect(found?.status).toBe('pending');
  });

  it('更新不存在的指标申请抛出错误', () => {
    getIndicatorApplications();
    expect(() =>
      updateIndicatorApplication('not-exist', { status: 'approved' }),
    ).toThrow('指标申请不存在');
  });

  /* ─── 序列化一致性 ─── */

  it('写入后读取数据一致', () => {
    getIndicatorApplications();
    const created = createIndicatorApplication({
      name: '一致性测试',
      code: 'CONSISTENT-001',
      source: '统一数据门户',
      status: 'editing',
      uploader: '测试员',
      indicatorData: {
        id: 'IND-CONSISTENT',
        name: '一致性测试',
        code: 'CONSISTENT-001',
        indicatorCode: 'CONS-001',
        indicatorDisplayName: '一致性测试',
        indicatorShowName: '一致',
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: true,
        department: '财务部',
        businessCaliber: '一致性测试口径',
        techCaliber: '一致性测试技术口径',
        tags: ['测试标签'],
        source: '统一数据门户',
      },
    });

    // 模拟刷新：重新从 localStorage 读取
    const apps = getIndicatorApplications();
    const found = apps.find((a) => a.id === created.id);
    expect(found).toEqual(created);
  });
});
