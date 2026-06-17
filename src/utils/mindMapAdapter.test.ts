import { describe, it, expect, vi } from 'vitest';
import {
  createDefaultGroupId,
  isDefaultGroupId,
  indicatorsToMindElixirData,
  mindElixirDataToIndicators,
  handleOperation,
  findParentId,
  type HandleOperationDeps,
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

    // 模拟 IndicatorTreePanel.mappedIndicators 的输出：合成"默认"节点 + 挂靠指标
    it('includes synthetic pending-node with children under default group', () => {
      const pendingNode = makeIndicator('ui-pending-财务部', '默认');
      const mapped = [
        pendingNode,
        makeIndicator('ind-new-1', '待挂靠指标1', 'ui-pending-财务部'),
        makeIndicator('ind-new-2', '待挂靠指标2', 'ui-pending-财务部'),
        makeIndicator('ind-1', '已有指标'),
      ];

      const data = indicatorsToMindElixirData(mapped, '财务部');

      // 根节点是 mindmap-default-group-财务部
      expect(data.id).toBe('mindmap-default-group-财务部');
      expect(data.topic).toBe('财务部');
      expect(data.expanded).toBe(true);

      // 应有 2 个根级子节点：ui-pending-财务部 和 ind-1
      expect(data.children).toHaveLength(2);

      const pendingChild = data.children!.find((c) => c.id === 'ui-pending-财务部');
      expect(pendingChild).toBeDefined();
      expect(pendingChild!.topic).toBe('默认');
      expect(pendingChild!.expanded).toBe(false);
      expect(pendingChild!.children).toHaveLength(2);
      expect(pendingChild!.children![0].id).toBe('ind-new-1');
      expect(pendingChild!.children![1].id).toBe('ind-new-2');

      const rootChild = data.children!.find((c) => c.id === 'ind-1');
      expect(rootChild).toBeDefined();
      expect(rootChild!.topic).toBe('已有指标');
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

    it('applies root style to depth=0 (米白背景 黑字 18px bold)', () => {
      const data = indicatorsToMindElixirData([], '财务部');

      expect(data.style).toBeDefined();
      expect(data.style!.background).toBe('#f5f5f0');
      expect(data.style!.color).toBe('#1a1a1a');
      expect(data.style!.fontSize).toBe('18px');
      expect(data.style!.fontWeight).toBe('700');
      expect(data.branchColor).toBeUndefined();
    });

    it('applies pending-node style and branchColor to ui-pending-* at depth=1', () => {
      const pendingNode = makeIndicator('ui-pending-财务部', '默认');
      const mapped = [
        pendingNode,
        makeIndicator('ind-new-1', '待挂靠指标1', 'ui-pending-财务部'),
      ];

      const data = indicatorsToMindElixirData(mapped, '财务部');
      const pendingChild = data.children!.find((c) => c.id === 'ui-pending-财务部')!;

      expect(pendingChild.branchColor).toBe('#eab308');
      expect(pendingChild.style).toBeDefined();
      expect(pendingChild.style!.background).toBe('rgba(234,179,8,0.2)');
      expect(pendingChild.style!.color).toBe('#f5f5f0');
      expect(pendingChild.style!.fontSize).toBe('16px');
      expect(pendingChild.style!.fontWeight).toBe('700');
      expect(pendingChild.style!.border).toBe('1px dashed #eab308');
    });

    it('applies palette branchColor to non-pending depth=1 nodes', () => {
      const indicators: IndicatorAttachment[] = [
        makeIndicator('group-a', '营收分析'),
        makeIndicator('group-b', '成本分析'),
        makeIndicator('ind-1', '指标', 'group-a'),
      ];

      const data = indicatorsToMindElixirData(indicators, '财务部');
      const children = data.children!;

      // group-a at index 0 → branchColor=#eab308, background=#fef08a
      expect(children[0].branchColor).toBe('#eab308');
      expect(children[0].style!.background).toBe('#fef08a');
      expect(children[0].style!.color).toBe('#1a1a1a');
      expect(children[0].style!.borderRadius).toBe('24px');

      // group-b at index 1 → branchColor=#8b5cf6, background=#ddd6fe
      expect(children[1].branchColor).toBe('#8b5cf6');
      expect(children[1].style!.background).toBe('#ddd6fe');
      expect(children[1].style!.borderRadius).toBe('24px');
    });

    it('applies leaf style to depth>=2 (纯白字 12px 无背景)', () => {
      const indicators: IndicatorAttachment[] = [
        makeIndicator('group', '分组'),
        makeIndicator('leaf', '叶子指标', 'group'),
      ];

      const data = indicatorsToMindElixirData(indicators, '财务部');
      const groupChild = data.children![0];
      const leafChild = groupChild.children![0];

      expect(leafChild.style!.color).toBe('#ffffff');
      expect(leafChild.style!.fontSize).toBe('12px');
      expect(leafChild.style!.background).toBeUndefined();
      // 叶子继承父的 branchColor palette 分配
      expect(leafChild.branchColor).toBeUndefined();
      expect(groupChild.branchColor).toBeDefined();
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

describe('findParentId', () => {
  const n = (id: string, children?: Record<string, unknown>[]): { id: string; children?: Record<string, unknown>[] } => ({ id, children });

  it('returns parent id for a direct child', () => {
    const tree = n('root', [n('a')]);
    expect(findParentId(tree, 'a')).toBe('root');
  });

  it('returns parent id for a nested child', () => {
    const tree = n('root', [n('a', [n('b')])]);
    expect(findParentId(tree, 'b')).toBe('a');
  });

  it('returns undefined for the root node', () => {
    const tree = n('root', [n('a')]);
    expect(findParentId(tree, 'root')).toBeUndefined();
  });

  it('returns undefined for a non-existent child', () => {
    const tree = n('root', [n('a')]);
    expect(findParentId(tree, 'missing')).toBeUndefined();
  });
});

describe('handleOperation', () => {
  const makeDeps = () => {
    const rename = vi.fn<(id: string, name: string) => void>();
    const add = vi.fn<(name: string, parentId?: string) => string | null>();
    add.mockReturnValue('new-id');
    const remove = vi.fn<(id: string) => void>();
    const setParent = vi.fn<(id: string, newParentId: string | undefined) => void>();
    const resolveParent = vi.fn<(id: string) => string | undefined>();
    return { rename, add, remove, setParent, resolveParent };
  };

  it('finishEdit calls rename with node id and new topic', () => {
    const deps = makeDeps();
    handleOperation({ name: 'finishEdit', obj: { id: 'ind-1', topic: '新名称' } }, deps);
    expect(deps.rename).toHaveBeenCalledWith('ind-1', '新名称');
    expect(deps.add).not.toHaveBeenCalled();
    expect(deps.remove).not.toHaveBeenCalled();
  });

  it('addChild calls add with topic and parent id from origin', () => {
    const deps = makeDeps();
    handleOperation(
      { name: 'addChild', obj: { id: 'ind-1', topic: '新节点' }, origin: { id: 'parent-id' } },
      deps,
    );
    expect(deps.add).toHaveBeenCalledWith('新节点', 'parent-id');
    expect(deps.rename).not.toHaveBeenCalled();
    expect(deps.remove).not.toHaveBeenCalled();
  });

  it('insertSibling calls add with topic and parent of origin', () => {
    const deps = makeDeps();
    deps.resolveParent.mockReturnValue('grandparent-id');
    handleOperation(
      {
        name: 'insertSibling',
        obj: { id: 'ind-2', topic: '兄弟节点' },
        origin: { id: 'sibling-id' },
      },
      deps,
    );
    expect(deps.resolveParent).toHaveBeenCalledWith('sibling-id');
    expect(deps.add).toHaveBeenCalledWith('兄弟节点', 'grandparent-id');
  });

  it('removeNode calls remove with node id', () => {
    const deps = makeDeps();
    handleOperation({ name: 'removeNode', obj: { id: 'ind-3' } }, deps);
    expect(deps.remove).toHaveBeenCalledWith('ind-3');
  });

  it('moveNode resolves new parent and calls setParent', () => {
    const deps = makeDeps();
    deps.resolveParent.mockReturnValue('new-parent-id');
    handleOperation({ name: 'moveNode', obj: { id: 'ind-4' } }, deps);
    expect(deps.resolveParent).toHaveBeenCalledWith('ind-4');
    expect(deps.setParent).toHaveBeenCalledWith('ind-4', 'new-parent-id');
  });

  it('unknown operation does not call any handler', () => {
    const deps = makeDeps();
    handleOperation({ name: 'unknownOp', obj: { id: 'ind-5' } }, deps);
    expect(deps.rename).not.toHaveBeenCalled();
    expect(deps.add).not.toHaveBeenCalled();
    expect(deps.remove).not.toHaveBeenCalled();
    expect(deps.setParent).not.toHaveBeenCalled();
  });
});
