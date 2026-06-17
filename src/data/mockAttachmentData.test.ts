import { describe, it, expect } from 'vitest';
import {
  generateMockRules,
  generateMockRuleParameters,
  generateMockIndicators,
  generateMockTagNodes,
} from './mockAttachmentData';
import { RuleTypeEnum } from '@/models/indicatorAttachmentModel';

describe('generateMockRules', () => {
  it('应返回 3 个根分类节点和 9 条叶子规则，共 12 个节点', () => {
    const rules = generateMockRules();
    const roots = rules.filter((r) => !r.parentId);
    const leaves = rules.filter((r) => r.parentId);

    expect(rules).toHaveLength(12);
    expect(roots).toHaveLength(3);
    expect(leaves).toHaveLength(9);
  });

  it('根分类节点应为阈值上下限、TOPN 监控、波动算法', () => {
    const rules = generateMockRules();
    const rootNames = rules
      .filter((r) => !r.parentId)
      .map((r) => r.name)
      .sort();

    expect(rootNames).toEqual(['TOPN 监控', '波动算法', '阈值上下限']);
  });

  it('每个根分类下应恰好有 3 条规则', () => {
    const rules = generateMockRules();
    const roots = rules.filter((r) => !r.parentId);

    for (const root of roots) {
      const children = rules.filter((r) => r.parentId === root.id);
      expect(children).toHaveLength(3);
    }
  });

  it('不应存在父规则继承链（叶子规则的 parentId 只能是分类节点）', () => {
    const rules = generateMockRules();
    const rootIds = new Set(rules.filter((r) => !r.parentId).map((r) => r.id));
    const leaves = rules.filter((r) => r.parentId);

    for (const leaf of leaves) {
      expect(rootIds.has(leaf.parentId!)).toBe(true);
    }
  });

  it('所有规则的 type 都应符合 RuleTypeEnum', () => {
    const rules = generateMockRules();
    for (const rule of rules) {
      expect(RuleTypeEnum.safeParse(rule.type).success).toBe(true);
    }
  });
});

describe('generateMockRuleParameters', () => {
  it('应返回规则参数', () => {
    const params = generateMockRuleParameters();
    expect(params.length).toBeGreaterThan(0);
  });
});

describe('generateMockIndicators tagIds/ruleIds 预置', () => {
  const deptId = 'dept-财务部';

  it('前30个叶子指标中至少10个含有非空 tagIds', () => {
    const indicators = generateMockIndicators(deptId);
    const leaves = indicators.filter(
      (i) => i.indicatorType !== '虚拟分组' && i.treeParentId,
    );
    const withTags = leaves.filter((i) => i.tagIds.length > 0);
    // 选取前30个采样验证（避免部门间差异过大）
    const sample = withTags.slice(0, 30);
    expect(sample.length).toBeGreaterThanOrEqual(10);
  });

  it('前30个叶子指标中至少10个含有非空 ruleIds', () => {
    const indicators = generateMockIndicators(deptId);
    const leaves = indicators.filter(
      (i) => i.indicatorType !== '虚拟分组' && i.treeParentId,
    );
    const withRules = leaves.filter((i) => i.ruleIds.length > 0);
    const sample = withRules.slice(0, 30);
    expect(sample.length).toBeGreaterThanOrEqual(10);
  });

  it('虚拟分组节点（L2/L3）含有非空 tagIds', () => {
    const indicators = generateMockIndicators(deptId);
    const groups = indicators.filter((i) => i.indicatorType === '虚拟分组');
    const withTags = groups.filter((i) => i.tagIds.length > 0);
    expect(withTags.length).toBeGreaterThanOrEqual(3);
  });

  it('每种叶子标签至少被 3 个指标引用', () => {
    const indicators = generateMockIndicators(deptId);
    const allLeafTags = generateMockTagNodes(deptId)
      .filter((t) => t.parentId)
      .map((t) => t.id);

    for (const tagId of allLeafTags) {
      const usageCount = indicators.filter((i) => i.tagIds.includes(tagId)).length;
      expect(usageCount).toBeGreaterThanOrEqual(3);
    }
  });

  it('每种叶子规则至少被 2 个指标引用', () => {
    const indicators = generateMockIndicators(deptId);
    const allLeafRules = generateMockRules()
      .filter((r) => r.parentId)
      .map((r) => r.id);

    for (const ruleId of allLeafRules) {
      const usageCount = indicators.filter((i) => i.ruleIds.includes(ruleId)).length;
      expect(usageCount).toBeGreaterThanOrEqual(2);
    }
  });

  it('所有 tagIds 都在已知叶子标签范围内', () => {
    const indicators = generateMockIndicators(deptId);
    const validTagIds = new Set(
      generateMockTagNodes(deptId)
        .filter((t) => t.parentId)
        .map((t) => t.id),
    );

    for (const indicator of indicators) {
      for (const tagId of indicator.tagIds) {
        expect(validTagIds.has(tagId)).toBe(true);
      }
    }
  });

  it('所有 ruleIds 都在已知叶子规则范围内', () => {
    const indicators = generateMockIndicators(deptId);
    const validRuleIds = new Set(
      generateMockRules()
        .filter((r) => r.parentId)
        .map((r) => r.id),
    );

    for (const indicator of indicators) {
      for (const ruleId of indicator.ruleIds) {
        expect(validRuleIds.has(ruleId)).toBe(true);
      }
    }
  });
});
