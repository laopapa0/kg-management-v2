import { describe, it, expect } from 'vitest';
import {
  indicatorAttachmentSchema,
  type IndicatorAttachment,
  createIndicatorAttachment,
} from './indicatorAttachmentModel';
import type { Indicator } from './indicatorModel';

describe('indicatorAttachmentModel', () => {
  // ─── Tracer bullet: 新字段存在 ───
  it('IndicatorAttachment 包含 treeParentId、tagIds、ruleIds 字段', () => {
    const indicator: IndicatorAttachment = createIndicatorAttachment({
      id: 'IND-1',
      name: '测试指标',
      code: 'TEST-001',
      indicatorCode: 'IC-001',
      indicatorDisplayName: '测试',
      indicatorShowName: '测试',
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
    });

    expect(indicator.treeParentId).toBeUndefined();
    expect(indicator.tagIds).toEqual([]);
    expect(indicator.ruleIds).toEqual([]);
  });

  // ─── treeParentId 一对一归属，可选 ───
  it('treeParentId 可赋值，表示挂接到指标树父节点', () => {
    const indicator: IndicatorAttachment = createIndicatorAttachment({
      id: 'IND-2',
      name: '测试指标2',
      code: 'TEST-002',
      indicatorCode: 'IC-002',
      indicatorDisplayName: '测试2',
      indicatorShowName: '测试2',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '利润',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: '财务部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      treeParentId: 'TREE-PARENT-1',
    });

    expect(indicator.treeParentId).toBe('TREE-PARENT-1');
  });

  // ─── tagIds 多对多，默认空数组 ───
  it('tagIds 默认为空数组，可被覆盖', () => {
    const indicator: IndicatorAttachment = createIndicatorAttachment({
      id: 'IND-3',
      name: '测试指标3',
      code: 'TEST-003',
      indicatorCode: 'IC-003',
      indicatorDisplayName: '测试3',
      indicatorShowName: '测试3',
      indicatorType: '基础指标',
      level1: '发展',
      level2: '用户发展',
      granularity: '省分',
      frequency: '日',
      unit: '百分比',
      isBigScreen: false,
      department: '市场部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
    });

    expect(indicator.tagIds).toEqual([]);

    const indicatorWithTags: IndicatorAttachment = createIndicatorAttachment({
      ...indicator,
      tagIds: ['TAG-1', 'TAG-2'],
    });

    expect(indicatorWithTags.tagIds).toEqual(['TAG-1', 'TAG-2']);
  });

  // ─── ruleIds 多对多，默认空数组 ───
  it('ruleIds 默认为空数组，可被覆盖', () => {
    const indicator: IndicatorAttachment = createIndicatorAttachment({
      id: 'IND-4',
      name: '测试指标4',
      code: 'TEST-004',
      indicatorCode: 'IC-004',
      indicatorDisplayName: '测试4',
      indicatorShowName: '测试4',
      indicatorType: '基础指标',
      level1: '交付',
      level2: '交付效率',
      granularity: '地市',
      frequency: '周',
      unit: '次',
      isBigScreen: false,
      department: '网络部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
    });

    expect(indicator.ruleIds).toEqual([]);

    const indicatorWithRules: IndicatorAttachment = createIndicatorAttachment({
      ...indicator,
      ruleIds: ['RULE-1'],
    });

    expect(indicatorWithRules.ruleIds).toEqual(['RULE-1']);
  });

  // ─── 兼容现有 Indicator 字段 ───
  it('IndicatorAttachment 是 Indicator 的超集', () => {
    const base: Indicator = {
      id: 'IND-5',
      name: '测试指标5',
      code: 'TEST-005',
      indicatorCode: 'IC-005',
      indicatorDisplayName: '测试5',
      indicatorShowName: '测试5',
      indicatorType: '复合指标',
      level1: '服务',
      level2: '客户满意度',
      granularity: '区县',
      frequency: '季',
      unit: '分',
      isBigScreen: true,
      department: '客服部',
      businessCaliber: '',
      techCaliber: '',
      tags: ['标签'],
      source: '测试来源',
    };

    const extended: IndicatorAttachment = createIndicatorAttachment({
      ...base,
      tagIds: ['TAG-EXT'],
      ruleIds: ['RULE-EXT'],
    });

    expect(extended.id).toBe(base.id);
    expect(extended.source).toBe('测试来源');
    expect(extended.tagIds).toEqual(['TAG-EXT']);
    expect(extended.ruleIds).toEqual(['RULE-EXT']);
  });

  // ─── Zod schema 验证字段 ───
  it('indicatorAttachmentSchema 验证通过完整字段', () => {
    const result = indicatorAttachmentSchema.safeParse({
      id: 'IND-6',
      name: '测试指标6',
      code: 'TEST-006',
      indicatorCode: 'IC-006',
      indicatorDisplayName: '测试6',
      indicatorShowName: '测试6',
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
      treeParentId: 'TREE-1',
      tagIds: ['TAG-A'],
      ruleIds: ['RULE-A'],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.treeParentId).toBe('TREE-1');
      expect(result.data.tagIds).toEqual(['TAG-A']);
      expect(result.data.ruleIds).toEqual(['RULE-A']);
    }
  });

  it('indicatorAttachmentSchema 对缺少 tagIds/ruleIds 的输入默认填充空数组', () => {
    const result = indicatorAttachmentSchema.safeParse({
      id: 'IND-7',
      name: '测试指标7',
      code: 'TEST-007',
      indicatorCode: 'IC-007',
      indicatorDisplayName: '测试7',
      indicatorShowName: '测试7',
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
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tagIds).toEqual([]);
      expect(result.data.ruleIds).toEqual([]);
      expect(result.data.treeParentId).toBeUndefined();
    }
  });
});
