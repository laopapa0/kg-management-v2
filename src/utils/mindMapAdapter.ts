import { buildIndicatorTree, type IndicatorTreeNode } from './attachmentTree';
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel';

/**
 * Mind Elixir 嵌套节点数据的最小子集。
 *
 * 不直接依赖 `mind-elixir` 的类型包，避免 adapter 被框架版本绑定。
 */
export interface MindElixirNodeData {
  id: string;
  topic: string;
  expanded?: boolean;
  children?: MindElixirNodeData[];
  style?: Record<string, string>;
  branchColor?: string;
  dangerouslySetInnerHTML?: string;
}

/** 二级节点分支调色板（8 色高对比，用于 branchColor + 连线） */
const BRANCH_PALETTE = [
  '#eab308', '#8b5cf6', '#22c55e', '#ef4444',
  '#3b82f6', '#f97316', '#ec4899', '#06b6d4',
];

/** 二级节点背景浅色版（Tailwind 200 级，黑字清晰可读） */
const BG_PALETTE = [
  '#fef08a', '#ddd6fe', '#bbf7d0', '#fecaca',
  '#bfdbfe', '#fed7aa', '#fbcfe8', '#a5f3fc',
];

/** 默认虚拟分组节点 ID 的固定前缀 */
export const DEFAULT_GROUP_ID_PREFIX = 'mindmap-default-group';

/**
 * 生成默认虚拟分组节点的稳定 ID。
 *
 * 规则：`mindmap-default-group-{seed}`。seed 通常使用部门 ID 或默认分组名，
 * 保证同一上下文下 `indicatorsToMindElixirData` 与连线投递逻辑使用同一 ID。
 */
export function createDefaultGroupId(seed: string): string {
  return `${DEFAULT_GROUP_ID_PREFIX}-${seed}`;
}

/**
 * 判断节点 ID 是否属于默认虚拟分组。
 */
export function isDefaultGroupId(id: string): boolean {
  return id.startsWith(`${DEFAULT_GROUP_ID_PREFIX}-`);
}

function convertIndicatorTreeNode(
  node: IndicatorTreeNode,
  depth: number,
  siblingIndex?: number,
): MindElixirNodeData {
  const isPending = node.id.startsWith('ui-pending-') || node.indicator.name === '默认';
  const isVirtualGroup = node.indicator.indicatorType === '虚拟分组';

  let style: Record<string, string> | undefined;
  let branchColor: string | undefined;

  if (depth === 0) {
    // 根节点（部门名）
    style = {
      background: '#f5f5f0',
      color: '#1a1a1a',
      fontSize: '18px',
      fontWeight: '700',
    };
  } else if (depth === 1) {
    if (isPending) {
      // "默认"待挂靠分组
      branchColor = '#eab308';
      style = {
        background: 'rgba(234,179,8,0.2)',
        color: '#f5f5f0',
        fontSize: '16px',
        fontWeight: '700',
        border: '1px dashed #eab308',
      };
    } else {
      // 其他二级分组：浅色背景 + 黑色字体 + 椭圆
      const idx = (siblingIndex ?? 0) % BRANCH_PALETTE.length;
      branchColor = BRANCH_PALETTE[idx];
      style = {
        background: BG_PALETTE[idx],
        color: '#1a1a1a',
        fontSize: '16px',
        fontWeight: '700',
        borderRadius: '24px',
      };
    }
  } else if (depth >= 2) {
    // 三级及以上叶子
    style = {
      color: '#ffffff',
      fontSize: '12px',
    };
  }

  return {
    id: node.id,
    topic: node.indicator.name,
    expanded: node.indicator.name === '默认' || node.indicator.name === '.' ? false : depth < 3,
    style,
    branchColor,
    children: node.children?.map((c, i) => convertIndicatorTreeNode(c, depth + 1, i)),
  };
}

function toplevelConvert(node: IndicatorTreeNode, index: number): MindElixirNodeData {
  return convertIndicatorTreeNode(node, 1, index);
}

/**
 * 将 IndicatorAttachment 平表转换为 Mind Elixir 可渲染的嵌套数据。
 *
 * 转换规则：
 * - 始终生成一个根级"默认"虚拟分组节点作为 Mind Elixir 的根
 * - 原有树结构的根节点（treeParentId 为空）会成为"默认"分组的直接子节点
 * - 原有子树层级保留，直接挂在"默认"分组下
 * - topic ← indicator.name，id ← indicator.id
 *
 * @param indicators 指标平表
 * @param defaultGroupName 默认分组名称，会作为根级虚拟分组节点的 topic
 */
export function indicatorsToMindElixirData(
  indicators: IndicatorAttachment[],
  defaultGroupName: string,
): MindElixirNodeData {
  const defaultGroupId = createDefaultGroupId(defaultGroupName);

  const defaultGroupIndicator = {
    id: defaultGroupId,
    name: defaultGroupName,
    treeParentId: undefined,
    tagIds: [],
    ruleIds: [],
  } as unknown as IndicatorAttachment;

  const tree = buildIndicatorTree([defaultGroupIndicator, ...indicators]);
  const defaultGroupNode = tree.find((node) => node.id === defaultGroupId);
  const orphanRoots = tree.filter((node) => node.id !== defaultGroupId);

  if (!defaultGroupNode) {
    // 防御性分支：理论上 defaultGroupIndicator 一定会成为根节点
    return {
      id: defaultGroupId,
      topic: defaultGroupName,
      expanded: true,
      children: orphanRoots.map((node, i) => toplevelConvert(node, i)),
    };
  }

  // 把其他根节点（含原 treeParentId 为空的指标、找不到父的孤儿节点）统一挂到默认分组下，
  // 保证 Mind Elixir 只有一个根节点。
  defaultGroupNode.children = [...(defaultGroupNode.children ?? []), ...orphanRoots];

  return convertIndicatorTreeNode(defaultGroupNode, 0);
}

/**
 * 将 Mind Elixir 嵌套数据还原为 IndicatorAttachment 平表。
 *
 * 还原规则：
 * - 根级"默认"虚拟分组节点不会被写入结果（它是 adapter 内部合成的）
 * - 默认分组的直接子节点，treeParentId = 默认分组 ID
 * - 更深层的子节点，treeParentId = 父节点 ID
 * - 非树字段（tagIds / ruleIds 等）从 existingIndicators 中保留
 *
 * @param data Mind Elixir 嵌套数据
 * @param existingIndicators 现有平表，用于保留非树字段
 */
export function mindElixirDataToIndicators(
  data: MindElixirNodeData,
  existingIndicators: IndicatorAttachment[],
): IndicatorAttachment[] {
  const existingMap = new Map(existingIndicators.map((indicator) => [indicator.id, indicator]));

  // 兼容两种结构：默认分组作为根，或被包装在更外层根下
  const defaultGroupId = isDefaultGroupId(data.id)
    ? data.id
    : data.children?.find((child) => isDefaultGroupId(child.id))?.id ?? data.id;

  const result: IndicatorAttachment[] = [];

  function walk(node: MindElixirNodeData, parentId: string | undefined): void {
    if (node.id !== defaultGroupId) {
      const existing = existingMap.get(node.id);
      if (existing) {
        const effectiveParentId =
          parentId === defaultGroupId && existing.treeParentId === undefined
            ? undefined
            : parentId;

        result.push({
          ...existing,
          treeParentId: effectiveParentId,
        });
      } else {
        console.warn(
          `[mindMapAdapter] 节点 ${node.id}（topic: ${node.topic}）在现有平表中不存在，已跳过`,
        );
      }
    }

    const nextParentId = node.id === defaultGroupId ? defaultGroupId : node.id;
    for (const child of node.children ?? []) {
      walk(child, nextParentId);
    }
  }

  walk(data, undefined);
  return result;
}

export interface HandleOperationDeps {
  rename: (id: string, name: string) => void;
  add: (name: string, parentId?: string) => string | null;
  remove: (id: string) => void;
  setParent: (id: string, newParentId: string | undefined) => void;
  resolveParent: (id: string) => string | undefined;
}

export function handleOperation(
  op: { name: string; obj?: { id: string; topic?: string; [key: string]: unknown }; origin?: { id?: string } },
  deps: HandleOperationDeps,
): void {
  switch (op.name) {
    case 'finishEdit': {
      if (op.obj?.id && op.obj?.topic) {
        deps.rename(op.obj.id, op.obj.topic);
      }
      break;
    }
    case 'addChild': {
      const parentId = op.origin?.id;
      if (op.obj?.topic) {
        deps.add(op.obj.topic, parentId);
      }
      break;
    }
    case 'insertSibling': {
      const siblingId = op.origin?.id;
      const parentId = siblingId ? deps.resolveParent(siblingId) : undefined;
      if (op.obj?.topic) {
        deps.add(op.obj.topic, parentId);
      }
      break;
    }
    case 'removeNode': {
      if (op.obj?.id) {
        deps.remove(op.obj.id);
      }
      break;
    }
    case 'moveNode': {
      if (op.obj?.id) {
        deps.setParent(op.obj.id, deps.resolveParent(op.obj.id));
      }
      break;
    }
  }
}

export function findParentId(data: { id: string; children?: Record<string, unknown>[] }, childId: string): string | undefined {
  for (const child of (data.children ?? []) as { id: string; children?: Record<string, unknown>[] }[]) {
    if (child.id === childId) return data.id;
    const found = findParentId(child, childId);
    if (found !== undefined) return found;
  }
  return undefined;
}
