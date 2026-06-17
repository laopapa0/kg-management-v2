import { describe, it, expect } from 'vitest';
import {
  generateMockRules,
  generateMockRuleParameters,
  generateMockIndicators,
  generateMockTagNodes,
} from './mockAttachmentData';
import { RuleTypeEnum } from '@/models/indicatorAttachmentModel';

describe('generateMockRules', () => {
  it('应返回 2 个根分类节点、3 个中间分类和 9 条叶子规则，共 14 个节点', () => {
    const rules = generateMockRules();
    const roots = rules.filter((r) => !r.parentId);
    const ruleIdsWithChildren = new Set(rules.map((r) => r.parentId).filter(Boolean));
    const leaves = rules.filter((r) => !ruleIdsWithChildren.has(r.id));
    const midCategories = rules.filter((r) => r.parentId && ruleIdsWithChildren.has(r.id));

    expect(rules).toHaveLength(14);
    expect(roots).toHaveLength(2);
    expect(midCategories).toHaveLength(3);
    expect(leaves).toHaveLength(9);
  });

  it('根分类节点应为异常规则、指标预警', () => {
    const rules = generateMockRules();
    const rootNames = rules
      .filter((r) => !r.parentId)
      .map((r) => r.name)
      .sort();

    expect(rootNames).toEqual(['异常规则', '指标预警']);
  });

  it('每个根分类下应包含中间分类，每个中间分类下恰好有 3 条叶子规则', () => {
    const rules = generateMockRules();
    const roots = rules.filter((r) => !r.parentId);

    for (const root of roots) {
      const midCategories = rules.filter((r) => r.parentId === root.id);
      expect(midCategories.length).toBeGreaterThan(0);
      for (const mid of midCategories) {
        const leaves = rules.filter((r) => r.parentId === mid.id);
        expect(leaves).toHaveLength(3);
      }
    }
  });

  it('叶子规则的 parentId 必须指向存在的规则', () => {
    const rules = generateMockRules();
    const ruleIds = new Set(rules.map((r) => r.id));
    const ruleIdsWithChildren = new Set(rules.map((r) => r.parentId).filter(Boolean));
    const leaves = rules.filter((r) => !ruleIdsWithChildren.has(r.id));

    for (const leaf of leaves) {
      expect(ruleIds.has(leaf.parentId!)).toBe(true);
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
    const allRules = generateMockRules();
    const ruleIdsWithChildren = new Set(allRules.map((r) => r.parentId).filter(Boolean));
    const allLeafRules = allRules
      .filter((r) => !ruleIdsWithChildren.has(r.id))
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
    const allRules = generateMockRules();
    const ruleIdsWithChildren = new Set(allRules.map((r) => r.parentId).filter(Boolean));
    const validRuleIds = new Set(
      allRules
        .filter((r) => !ruleIdsWithChildren.has(r.id))
        .map((r) => r.id),
    );

    for (const indicator of indicators) {
      for (const ruleId of indicator.ruleIds) {
        expect(validRuleIds.has(ruleId)).toBe(true);
      }
    }
  });
});
