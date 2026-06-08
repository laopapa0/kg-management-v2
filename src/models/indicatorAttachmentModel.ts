import { z } from 'zod';
import type { Indicator } from './indicatorModel';

/**
 * v2 指标挂靠扩展字段
 *
 * 在原有 Indicator 平表基础上，增加三个关系字段，支持：
 * - 指标树一对一归属（treeParentId）
 * - 标签集多对多关联（tagIds）
 * - 规则多对多关联（ruleIds）
 */
export interface AttachmentFields {
  /** 指标树父节点 ID，未挂靠树时为空 */
  treeParentId?: string;
  /** 关联的标签 ID 数组（多对多） */
  tagIds: string[];
  /** 关联的规则 ID 数组（多对多） */
  ruleIds: string[];
}

/** v2 指标挂靠模型 = 原有 Indicator + 挂靠关系字段 */
export type IndicatorAttachment = Indicator & AttachmentFields;

/** Zod Schema 用于验证和提供默认值 */
export const indicatorAttachmentSchema = z
  .object({
    treeParentId: z.string().optional(),
    tagIds: z.array(z.string()).default([]),
    ruleIds: z.array(z.string()).default([]),
  })
  .passthrough();

/**
 * 创建带默认值的 IndicatorAttachment
 *
 * 未显式传入 tagIds / ruleIds 时默认填充空数组；
 * treeParentId 保持可选，不传入即为 undefined。
 */
export function createIndicatorAttachment(
  indicator: Omit<Indicator, 'tags'> & Partial<AttachmentFields> & Pick<Indicator, 'tags'>,
): IndicatorAttachment {
  const base = {
    ...indicator,
    tagIds: indicator.tagIds ?? [],
    ruleIds: indicator.ruleIds ?? [],
  };
  return indicatorAttachmentSchema.parse(base) as unknown as IndicatorAttachment;
}

function generateIndicatorId(): string {
  return `ind-generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 创建最小 IndicatorAttachment，用于指标树快速添加虚拟分组节点
 *
 * 本期先统一作为虚拟分组节点（只存 name/parentId），后续再区分类型。
 */
export function createMinimalIndicatorAttachment(
  name: string,
  options: { parentId?: string; department?: string } = {},
): IndicatorAttachment {
  const id = generateIndicatorId();
  return createIndicatorAttachment({
    id,
    name,
    code: `GROUP-${id.slice(-8).toUpperCase()}`,
    indicatorCode: '',
    indicatorDisplayName: name,
    indicatorShowName: name,
    indicatorType: '虚拟分组',
    level1: '',
    level2: '',
    granularity: '',
    frequency: '',
    unit: '',
    isBigScreen: false,
    department: options.department ?? '',
    businessCaliber: '',
    techCaliber: '',
    tags: [],
    treeParentId: options.parentId,
    tagIds: [],
    ruleIds: [],
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ─── TagNode + Rule + RuleParameter 模型 ─── */
/* ─────────────────────────────────────────────────────────────────────────── */

/** 标签节点 */
export interface TagNode {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  children?: TagNode[];
}

export const tagNodeSchema: z.ZodType<TagNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    parentId: z.string().optional(),
    color: z.string().optional(),
    children: z.array(tagNodeSchema).optional(),
  }),
);

/** 规则类型枚举 */
export const RuleTypeEnum = z.enum(['threshold', 'fluctuation', 'topn']);
export type RuleType = z.infer<typeof RuleTypeEnum>;

/** 规则参数实例（联合主键：ruleId + indicatorId） */
export interface RuleParameter {
  ruleId: string;
  indicatorId: string;
  upperLimit?: number;
  lowerLimit?: number;
  unit?: string;
  level?: 'P1' | 'P2' | 'P3' | 'P4';
  isInherited?: boolean;
  overriddenFields?: string[];
  /** 波动检测算法，例如 '3σ' */
  algorithm?: string;
  /** 时间窗口，例如 '5min' */
  window?: string;
  /** TOPN 数量 */
  n?: number;
  /** TOPN 维度，例如 'QPS' */
  dimension?: string;
}

export const ruleParameterSchema: z.ZodType<RuleParameter> = z.object({
  ruleId: z.string(),
  indicatorId: z.string(),
  upperLimit: z.number().optional(),
  lowerLimit: z.number().optional(),
  unit: z.string().optional(),
  level: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
  isInherited: z.boolean().optional(),
  overriddenFields: z.array(z.string()).optional(),
  algorithm: z.string().optional(),
  window: z.string().optional(),
  n: z.number().optional(),
  dimension: z.string().optional(),
});

/** 规则节点 */
export interface Rule {
  id: string;
  name: string;
  type: RuleType;
  enabled?: boolean;
  parentId?: string;
  parameters?: RuleParameter[];
  children?: Rule[];
}

export const ruleSchema: z.ZodType<Rule> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    type: RuleTypeEnum,
    enabled: z.boolean().optional(),
    parentId: z.string().optional(),
    parameters: z.array(ruleParameterSchema).optional(),
    children: z.array(ruleSchema).optional(),
  }),
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* ─── 平表 → 嵌套树 工具函数 ─── */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * 将 TagNode 平表数组转换为嵌套树
 *
 * 找不到 parentId 的节点会被提升为根节点（防御性处理，避免数据丢失）。
 */
export function buildTagTree(flat: TagNode[]): TagNode[] {
  if (flat.length === 0) return [];

  const nodeMap = new Map<string, TagNode>();
  const roots: TagNode[] = [];

  // 第一遍：创建节点副本并建立 id -> node 映射
  for (const node of flat) {
    const copy: TagNode = { ...node, children: undefined };
    nodeMap.set(copy.id, copy);
  }

  // 第二遍：挂载到父节点或作为根节点
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * 将 Rule 平表数组转换为嵌套树
 *
 * 找不到 parentId 的节点会被提升为根节点。
 */
export function buildRuleTree(flat: Rule[]): Rule[] {
  if (flat.length === 0) return [];

  const nodeMap = new Map<string, Rule>();
  const roots: Rule[] = [];

  for (const node of flat) {
    const copy: Rule = { ...node, children: undefined };
    nodeMap.set(copy.id, copy);
  }

  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
