import { describe, it, expect } from 'vitest';
import { indicatorDefinitions, type IndicatorDefinition } from './indicatorDefinitions';

describe('indicatorDefinitions', () => {
  it('应包含 1434 个指标定义', () => {
    expect(indicatorDefinitions).toHaveLength(1434);
  });

  it('指标编码应唯一', () => {
    const codes = indicatorDefinitions.map((ind) => ind.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('id 应唯一且非空', () => {
    const ids = indicatorDefinitions.map((ind) => ind.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });

  it('每个指标定义都应包含必需的字段且类型正确', () => {
    for (const ind of indicatorDefinitions) {
      expect(typeof ind.id).toBe('string');
      expect(typeof ind.code).toBe('string');
      expect(ind.code).not.toBe('');
      expect(typeof ind.name).toBe('string');
      expect(ind.name).not.toBe('');
      expect(typeof ind.level1).toBe('string');
      expect(typeof ind.level2).toBe('string');
      expect(typeof ind.frequency).toBe('string');
      expect(typeof ind.granularity).toBe('string');
      expect(typeof ind.department).toBe('string');
      expect(typeof ind.isBigScreen).toBe('boolean');
      expect(ind.treeParentId).toBeDefined();
      expect(typeof ind.treeParentId).toBe('string');
    }
  });

  it('level1/level2 中不应包含 "/"，应已替换为"未分类"', () => {
    for (const ind of indicatorDefinitions) {
      expect(ind.level1).not.toBe('/');
      expect(ind.level2).not.toBe('/');
      expect(ind.level1.trim()).not.toBe('');
      expect(ind.level2.trim()).not.toBe('');
    }
  });

  it('对接部门应去重并 trim，数量为 12 个', () => {
    const departments = indicatorDefinitions
      .map((ind) => ind.department)
      .filter(Boolean);
    const uniqueDepartments = new Set(departments);
    expect(uniqueDepartments.size).toBe(12);

    // 不应存在带尾部空格的部门
    for (const dept of uniqueDepartments) {
      expect(dept).toBe(dept.trim());
    }
  });

  it('treeParentId 不应悬空', () => {
    // 推断所有可能的父节点 ID
    const parentIds = new Set<string>();
    for (const ind of indicatorDefinitions) {
      const { department, level1, level2 } = ind;
      // treeParentId 格式: l3-{dept}-{level1}-{level2} 或 dept-{dept}-pending
      const base = `l3-${department}-${level1}`;
      parentIds.add(`${base}-${level2}`);
      parentIds.add(`${base}-.`);
      parentIds.add(`dept-${department}-pending`);
    }

    for (const ind of indicatorDefinitions) {
      expect(parentIds.has(ind.treeParentId!)).toBe(true);
    }
  });

  it('指标类型应为"原子指标"或"派生指标"', () => {
    const validTypes = new Set(['原子指标', '派生指标']);
    for (const ind of indicatorDefinitions) {
      expect(validTypes.has(ind.indicatorType)).toBe(true);
    }
  });

  it('不应存在 screen 字段', () => {
    for (const ind of indicatorDefinitions) {
      expect('screen' in ind).toBe(false);
    }
  });
});
