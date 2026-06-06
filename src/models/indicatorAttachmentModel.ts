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
  return {
    ...indicator,
    tagIds: indicator.tagIds ?? [],
    ruleIds: indicator.ruleIds ?? [],
  } as IndicatorAttachment;
}
