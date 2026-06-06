import { describe, it, expect } from 'vitest';
import { getObjectTypeFieldKeys, type Indicator } from './indicatorModel';

describe('Indicator model', () => {
  // ─── Tracer bullet: source field ───
  it('可以创建包含 source 字段的 Indicator', () => {
    const indicator: Indicator = {
      id: 'IND-TEST',
      name: '测试指标',
      code: 'TEST-001',
      indicatorCode: 'TC-001',
      indicatorDisplayName: '测试指标显示名',
      indicatorShowName: '测试',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '收入',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: true,
      department: '财务部',
      businessCaliber: '测试业务口径',
      techCaliber: '测试技术口径',
      tags: ['测试标签'],
      source: '统一数据门户',
    };

    expect(indicator.source).toBe('统一数据门户');
  });

  // ─── 向后兼容: source 为可选字段 ───
  it('可以创建不包含 source 字段的 Indicator', () => {
    const indicator: Indicator = {
      id: 'IND-TEST-2',
      name: '测试指标2',
      code: 'TEST-002',
      indicatorCode: 'TC-002',
      indicatorDisplayName: '测试指标显示名2',
      indicatorShowName: '测试2',
      indicatorType: '衍生指标',
      level1: '发展',
      level2: '用户发展',
      granularity: '省分',
      frequency: '日',
      unit: '百分比',
      isBigScreen: false,
      department: '市场部',
      businessCaliber: '测试业务口径2',
      techCaliber: '测试技术口径2',
      tags: [],
    };

    expect(indicator.source).toBeUndefined();
  });

  // ─── source 不混入属性结构图字段 ───
  it('getObjectTypeFieldKeys 不包含 source', () => {
    const keys = getObjectTypeFieldKeys();
    expect(keys).not.toContain('source');
  });
});
