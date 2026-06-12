import { describe, it, expect } from 'vitest';
import {
  createDefaultGroupId,
  isDefaultGroupId,
  indicatorsToMindElixirData,
  mindElixirDataToIndicators,
} from './mindMapAdapter';
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel';

function makeIndicator(
  id: string,
  name: string,
  treeParentId?: string,
): IndicatorAttachment {
  return {
    id,
    name,
    treeParentId,
    tagIds: [],
    ruleIds: [],
  } as IndicatorAttachment;
}

describe('mindMapAdapter', () => {
  describe('createDefaultGroupId / isDefaultGroupId', () => {
    it('generates stable id with fixed prefix', () => {
      expect(createDefaultGroupId('finance')).toBe('mindmap-default-group-finance');
      expect(createDefaultGroupId('a')).toBe('mindmap-default-group-a');
    });

    it('recognizes default group ids', () => {
      expect(isDefaultGroupId('mindmap-default-group-finance')).toBe(true);
      expect(isDefaultGroupId('mindmap-default-group-')).toBe(true);
      expect(isDefaultGroupId('mindmap-default')).toBe(false);
      expect(isDefaultGroupId('ind-1')).toBe(false);
    });
  });

  describe('indicatorsToMindElixirData', () => {
    it('returns a default group root for empty input', () => {
      const data = indicatorsToMindElixirData([], '默认分组');

      expect(data.id).toBe('mindmap-default-group-默认分组');
      expect(data.topic).toBe('默认分组');
      expect(data.children).toEqual([]);
    });

    it('maps topic from name and id from indicator id', () => {
      const data = indicatorsToMindElixirData(
        [makeIndicator('ind-1', '营收同比增长率')],
        '默认分组',
      );

      expect(data.topic).toBe('默认分组');
      expect(data.children).toHaveLength(1);
      expect(data.children![0].id).toBe('ind-1');
      expect(data.children![0].topic).toBe('营收同比增长率');
    });

    it('places root indicators under the default group', () => {
      const data = indicatorsToMindElixirData(
        [
          makeIndicator('ind-1', '父指标'),
          makeIndicator('ind-2', '子指标', 'ind-1'),
        ],
        '默认分组',
      );

      expect(data.id).toBe('mindmap-default-group-默认分组');
      expect(data.children).toHaveLength(1);
      expect(data.children![0].id).toBe('ind-1');
      expect(data.children![0].children).toHaveLength(1);
      expect(data.children![0].children![0].id).toBe('ind-2');
    });

    it('preserves three-level nesting', () => {
      const data = indicatorsToMindElixirData(
        [
          makeIndicator('l1', '一级'),
          makeIndicator('l2', '二级', 'l1'),
          makeIndicator('l3', '三级', 'l2'),
        ],
        '默认分组',
      );

      const level1 = data.children![0];
      const level2 = level1.children![0];
      const level3 = level2.children![0];

      expect(level1.id).toBe('l1');
      expect(level2.id).toBe('l2');
      expect(level3.id).toBe('l3');
      expect(level3.children).toBeUndefined();
    });

    it('places orphan nodes under the default group', () => {
      const data = indicatorsToMindElixirData(
        [makeIndicator('ind-1', '孤儿', 'missing-parent')],
        '默认分组',
      );

      expect(data.children).toHaveLength(1);
      expect(data.children![0].id).toBe('ind-1');
    });

    it('handles 100+ nodes efficiently', () => {
      const indicators: IndicatorAttachment[] = [];
      for (let i = 1; i <= 150; i++) {
        const parentId = i > 1 ? `ind-${Math.floor(i / 2)}` : undefined;
        indicators.push(makeIndicator(`ind-${i}`, `指标 ${i}`, parentId));
      }

      const data = indicatorsToMindElixirData(indicators, '默认分组');

      let count = 0;
      function countNodes(node: typeof data): void {
        count++;
        node.children?.forEach(countNodes);
      }
      countNodes(data);

      // 150 个指标 + 1 个默认分组根
      expect(count).toBe(151);
      expect(data.children).toHaveLength(1);
      expect(data.children![0].id).toBe('ind-1');
    });
  });

  describe('mindElixirDataToIndicators', () => {
    it('rebuilds treeParentId for direct children of default group', () => {
      const existing = [makeIndicator('ind-1', '营收')];
      const data = indicatorsToMindElixirData(existing, '默认分组');
      const restored = mindElixirDataToIndicators(data, existing);

      expect(restored).toHaveLength(1);
      expect(restored[0].id).toBe('ind-1');
      // 原本 treeParentId 为 undefined 的根节点，还原后保持 undefined
      expect(restored[0].treeParentId).toBeUndefined();
    });

    it('rebuilds treeParentId for deeper nodes', () => {
      const existing = [
        makeIndicator('ind-1', '父指标'),
        makeIndicator('ind-2', '子指标', 'ind-1'),
      ];
      const data = indicatorsToMindElixirData(existing, '默认分组');
      const restored = mindElixirDataToIndicators(data, existing);

      const parent = restored.find((i) => i.id === 'ind-1');
      const child = restored.find((i) => i.id === 'ind-2');

      // 原本 treeParentId 为 undefined 的根节点，还原后保持 undefined
      expect(parent?.treeParentId).toBeUndefined();
      expect(child?.treeParentId).toBe('ind-1');
    });

    it('preserves non-tree fields from existing indicators', () => {
      const existing: IndicatorAttachment[] = [
        {
          id: 'ind-1',
          name: '指标',
          treeParentId: undefined,
          tagIds: ['tag-1'],
          ruleIds: ['rule-1', 'rule-2'],
        } as IndicatorAttachment,
      ];
      const data = indicatorsToMindElixirData(existing, '默认分组');
      const restored = mindElixirDataToIndicators(data, existing);

      expect(restored[0].tagIds).toEqual(['tag-1']);
      expect(restored[0].ruleIds).toEqual(['rule-1', 'rule-2']);
    });

    it('round-trips flat → nested → flat for complex tree', () => {
      const existing = [
        makeIndicator('root-1', '根1'),
        makeIndicator('root-2', '根2'),
        makeIndicator('child-1', '子1', 'root-1'),
        makeIndicator('child-2', '子2', 'root-1'),
        makeIndicator('grandchild-1', '孙1', 'child-2'),
      ];
      const data = indicatorsToMindElixirData(existing, '默认分组');
      const restored = mindElixirDataToIndicators(data, existing);

      expect(restored).toHaveLength(5);
      expect(restored.find((i) => i.id === 'root-1')?.treeParentId).toBeUndefined();
      expect(restored.find((i) => i.id === 'root-2')?.treeParentId).toBeUndefined();
      expect(restored.find((i) => i.id === 'child-1')?.treeParentId).toBe('root-1');
      expect(restored.find((i) => i.id === 'child-2')?.treeParentId).toBe('root-1');
      expect(restored.find((i) => i.id === 'grandchild-1')?.treeParentId).toBe('child-2');
    });

    it('skips the synthetic default group node in output', () => {
      const existing = [makeIndicator('ind-1', '指标')];
      const data = indicatorsToMindElixirData(existing, '默认分组');
      const restored = mindElixirDataToIndicators(data, existing);

      expect(restored.some((i) => i.id === 'mindmap-default-group-默认分组')).toBe(false);
    });

    it('handles default group wrapped in a synthetic root', () => {
      const existing = [makeIndicator('ind-1', '指标')];
      const inner = indicatorsToMindElixirData(existing, '默认分组');
      const wrapped: typeof inner = {
        id: 'mindmap-root',
        topic: '指标树',
        expanded: true,
        children: [inner],
      };

      const restored = mindElixirDataToIndicators(wrapped, existing);

      expect(restored).toHaveLength(1);
      // 原本 treeParentId 为 undefined 的根节点，还原后保持 undefined
      expect(restored[0].treeParentId).toBeUndefined();
    });
  });
});
