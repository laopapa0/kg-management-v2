/**
 * 知识文档审核状态机
 *
 * 纯函数：给定当前状态和操作，返回下一状态和（可选的）审核记录
 */

import type { DocumentStatus } from '@/models/knowledgeBaseModel';

export type AuditAction =
  | 'SUBMIT_AUDIT'
  | 'START_AUDIT'
  | 'APPROVE'
  | 'REJECT'
  | 'RE_EDIT';

export interface TransitionPayload {
  auditor?: string;
  reason?: string;
}

export interface AuditRecord {
  status: DocumentStatus;
  auditor: string;
  auditTime: string;
  reason: string;
}

export interface TransitionResult {
  status: DocumentStatus;
  auditRecord?: AuditRecord;
}

/** 有效的状态流转表：currentStatus → 允许的 actions */
const VALID_TRANSITIONS: Record<DocumentStatus, AuditAction[]> = {
  editing: ['SUBMIT_AUDIT'],
  pending: ['START_AUDIT'],
  auditing: ['APPROVE', 'REJECT'],
  approved: [],
  rejected: ['RE_EDIT'],
};

/** 状态流转：返回新状态和可选的审核记录 */
export function transitionStatus(
  currentStatus: DocumentStatus,
  action: AuditAction,
  payload?: TransitionPayload,
): TransitionResult {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed.includes(action)) {
    throw new Error(
      `无效的状态流转: ${currentStatus} 不允许执行 ${action}`,
    );
  }

  const now = new Date().toISOString();
  const auditor = payload?.auditor?.trim() || 'NOC审核员';

  switch (action) {
    case 'SUBMIT_AUDIT':
      return { status: 'pending' };

    case 'START_AUDIT':
      return { status: 'auditing' };

    case 'APPROVE':
      return {
        status: 'approved',
        auditRecord: {
          status: 'approved',
          auditor,
          auditTime: now,
          reason: payload?.reason?.trim() || '',
        },
      };

    case 'REJECT':
      return {
        status: 'rejected',
        auditRecord: {
          status: 'rejected',
          auditor,
          auditTime: now,
          reason: payload?.reason?.trim() || '',
        },
      };

    case 'RE_EDIT':
      return { status: 'pending' };

    default:
      throw new Error(`未知操作: ${action}`);
  }
}

/** 检查某个操作在当前状态下是否合法（用于 UI 按钮显隐） */
export function canPerformAction(
  currentStatus: DocumentStatus,
  action: AuditAction,
): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(action);
}
