import { describe, it, expect } from 'vitest';
import {
  indicatorAttachmentSchema,
  type IndicatorAttachment,
  createIndicatorAttachment,
  type TagNode,
  type Rule,
  type RuleParameter,
  buildTagTree,
  buildRuleTree,
  tagNodeSchema,
  ruleSchema,
  ruleParameterSchema,
  RuleType,
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

  it('createIndicatorAttachment 使用 indicatorAttachmentSchema 做运行时校验并拒绝非法 tagIds 类型', () => {
    expect(() =>
      createIndicatorAttachment({
        id: 'IND-BAD',
        name: '测试',
        code: 'BAD-001',
        indicatorCode: 'BAD-001',
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
        // @ts-expect-error 故意传入非法类型验证 schema
        tagIds: 'not-an-array',
      }),
    ).toThrow();
  });
});

describe('TagNode + Rule + RuleParameter models', () => {
  // ─── TagNode 字段定义 ───
  it('TagNode 包含 id / name / parentId? / color? / children? 字段', () => {
    const node: TagNode = {
      id: 'TAG-1',
      name: '利润',
      parentId: 'TAG-ROOT',
      color: '#3B82F6',
    };

    expect(node.id).toBe('TAG-1');
    expect(node.name).toBe('利润');
    expect(node.parentId).toBe('TAG-ROOT');
    expect(node.color).toBe('#3B82F6');
    expect(node.children).toBeUndefined();
  });

  it('tagNodeSchema 验证合法 TagNode', () => {
    const result = tagNodeSchema.safeParse({
      id: 'TAG-1',
      name: '利润',
      parentId: 'TAG-ROOT',
      color: '#3B82F6',
    });

    expect(result.success).toBe(true);
  });

  // ─── Rule 字段定义 ───
  it('Rule enabled 字段为可选布尔值', () => {
    const ruleWithEnabled: Rule = {
      id: 'RULE-1',
      name: '营收波动检测',
      type: 'fluctuation',
      enabled: true,
    };
    expect(ruleWithEnabled.enabled).toBe(true);

    const ruleWithout: Rule = {
      id: 'RULE-2',
      name: '营收波动检测',
      type: 'fluctuation',
    };
    expect(ruleWithout.enabled).toBeUndefined();
  });

  it('Rule 可以显式设置 enabled 为 false', () => {
    const rule: Rule = {
      id: 'RULE-2',
      name: '停用规则',
      type: 'threshold',
      enabled: false,
    };

    expect(rule.enabled).toBe(false);
  });

  it('Rule schema 接受 enabled 字段', () => {
    const result = ruleSchema.safeParse({
      id: 'RULE-3',
      name: '测试规则',
      type: 'threshold',
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('Rule 包含 id / name / type / parentId? / parameters? / children? 字段', () => {
    const rule: Rule = {
      id: 'RULE-1',
      name: '营收波动检测',
      type: 'fluctuation',
      parentId: 'RULE-ROOT',
    };

    expect(rule.id).toBe('RULE-1');
    expect(rule.name).toBe('营收波动检测');
    expect(rule.type).toBe('fluctuation');
    expect(rule.parentId).toBe('RULE-ROOT');
  });

  it('Rule type 只允许 threshold / fluctuation / topn', () => {
    expect(() => {
      const _invalid: Rule = {
        id: 'RULE-X',
        name: '非法规则',
        type: 'unknown' as RuleType,
      };
      void _invalid;
    }).not.toThrow();

    const valid = ruleSchema.safeParse({
      id: 'RULE-1',
      name: '营收波动检测',
      type: 'fluctuation',
    });
    expect(valid.success).toBe(true);

    const invalid = ruleSchema.safeParse({
      id: 'RULE-1',
      name: '营收波动检测',
      type: 'unknown',
    });
    expect(invalid.success).toBe(false);
  });

  // ─── RuleParameter 字段定义 ───
  it('RuleParameter 包含所有参数字段', () => {
    const param: RuleParameter = {
      ruleId: 'RULE-1',
      indicatorId: 'IND-1',
      upperLimit: 120,
      lowerLimit: 80,
      unit: '百分比',
      level: 'P2',
      isInherited: false,
      overriddenFields: ['upperLimit', 'lowerLimit'],
    };

    expect(param.ruleId).toBe('RULE-1');
    expect(param.indicatorId).toBe('IND-1');
    expect(param.upperLimit).toBe(120);
    expect(param.lowerLimit).toBe(80);
    expect(param.unit).toBe('百分比');
    expect(param.level).toBe('P2');
    expect(param.isInherited).toBe(false);
    expect(param.overriddenFields).toEqual(['upperLimit', 'lowerLimit']);
  });

  it('ruleParameterSchema 验证合法 RuleParameter', () => {
    const result = ruleParameterSchema.safeParse({
      ruleId: 'RULE-1',
      indicatorId: 'IND-1',
      upperLimit: 120,
      lowerLimit: 80,
      unit: '百分比',
      level: 'P2',
      isInherited: false,
      overriddenFields: ['upperLimit'],
    });

    expect(result.success).toBe(true);
  });

  // ─── buildTagTree 平表转嵌套树 ───
  it('buildTagTree 将平表数组转换为嵌套树', () => {
    const flat: TagNode[] = [
      { id: 'T1', name: '财务' },
      { id: 'T2', name: '利润', parentId: 'T1' },
      { id: 'T3', name: '成本', parentId: 'T1' },
      { id: 'T4', name: '净利润', parentId: 'T2' },
    ];

    const tree = buildTagTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('T1');
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children?.map((c) => c.id).sort()).toEqual(['T2', 'T3']);

    const profit = tree[0].children?.find((c) => c.id === 'T2');
    expect(profit?.children).toHaveLength(1);
    expect(profit?.children?.[0].id).toBe('T4');
  });

  it('buildTagTree 空数组返回空数组', () => {
    expect(buildTagTree([])).toEqual([]);
  });

  it('buildTagTree 对找不到 parentId 的节点作为根节点处理', () => {
    const flat: TagNode[] = [
      { id: 'T1', name: '根' },
      { id: 'T2', name: '孤儿', parentId: 'NOT-EXIST' },
    ];

    const tree = buildTagTree(flat);

    expect(tree).toHaveLength(2);
    expect(tree.map((n) => n.id).sort()).toEqual(['T1', 'T2']);
  });

  // ─── buildRuleTree 平表转嵌套树 ───
  it('buildRuleTree 将平表数组转换为嵌套树', () => {
    const flat: Rule[] = [
      { id: 'R1', name: '基础设施监控', type: 'threshold' },
      { id: 'R2', name: '营收波动检测', type: 'fluctuation', parentId: 'R1' },
      { id: 'R3', name: 'TopN 分析', type: 'topn', parentId: 'R1' },
    ];

    const tree = buildRuleTree(flat);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('R1');
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children?.map((c) => c.id).sort()).toEqual(['R2', 'R3']);
  });

  it('buildRuleTree 空数组返回空数组', () => {
    expect(buildRuleTree([])).toEqual([]);
  });

  it('buildRuleTree 保留 parameters 字段', () => {
    const flat: Rule[] = [
      {
        id: 'R1',
        name: '规则',
        type: 'threshold',
        parameters: [
          { ruleId: 'R1', indicatorId: 'IND-1', upperLimit: 100 },
        ],
      },
    ];

    const tree = buildRuleTree(flat);

    expect(tree[0].parameters).toHaveLength(1);
    expect(tree[0].parameters?.[0].upperLimit).toBe(100);
  });

  it('buildRuleTree 对找不到 parentId 的节点作为根节点处理', () => {
    const flat: Rule[] = [
      { id: 'R1', name: '根规则', type: 'threshold' },
      { id: 'R2', name: '孤儿规则', type: 'topn', parentId: 'NOT-EXIST' },
    ];

    const tree = buildRuleTree(flat);

    expect(tree).toHaveLength(2);
    expect(tree.map((n) => n.id).sort()).toEqual(['R1', 'R2']);
  });
});
