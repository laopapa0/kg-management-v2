import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  transitionStatus,
  canPerformAction,
  type AuditAction,
} from './knowledgeBaseStateMachine';
import type { DocumentStatus } from '@/models/knowledgeBaseModel';

describe('transitionStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('editing → SUBMIT_AUDIT → pending', () => {
    const result = transitionStatus('editing', 'SUBMIT_AUDIT');
    expect(result.status).toBe('pending');
    expect(result.auditRecord).toBeUndefined();
  });

  it('pending → START_AUDIT → auditing', () => {
    const result = transitionStatus('pending', 'START_AUDIT');
    expect(result.status).toBe('auditing');
    expect(result.auditRecord).toBeUndefined();
  });

  it('auditing → APPROVE → approved with audit record', () => {
    const result = transitionStatus('auditing', 'APPROVE', {
      auditor: 'NOC小李',
      reason: '内容完整',
    });
    expect(result.status).toBe('approved');
    expect(result.auditRecord).toEqual({
      status: 'approved',
      auditor: 'NOC小李',
      auditTime: '2026-06-06T10:00:00.000Z',
      reason: '内容完整',
    });
  });

  it('auditing → REJECT → rejected with audit record', () => {
    const result = transitionStatus('auditing', 'REJECT', {
      auditor: 'NOC小王',
      reason: '格式不规范',
    });
    expect(result.status).toBe('rejected');
    expect(result.auditRecord).toEqual({
      status: 'rejected',
      auditor: 'NOC小王',
      auditTime: '2026-06-06T10:00:00.000Z',
      reason: '格式不规范',
    });
  });

  it('rejected → RE_EDIT → pending', () => {
    const result = transitionStatus('rejected', 'RE_EDIT');
    expect(result.status).toBe('pending');
    expect(result.auditRecord).toBeUndefined();
  });

  it('uses default auditor when not provided', () => {
    const result = transitionStatus('auditing', 'APPROVE');
    expect(result.auditRecord?.auditor).toBe('NOC审核员');
  });

  it('trims auditor and reason', () => {
    const result = transitionStatus('auditing', 'REJECT', {
      auditor: '  NOC小李  ',
      reason: '  格式不规范  ',
    });
    expect(result.auditRecord?.auditor).toBe('NOC小李');
    expect(result.auditRecord?.reason).toBe('格式不规范');
  });

  it('throws for invalid transitions', () => {
    expect(() => transitionStatus('approved', 'APPROVE')).toThrow(
      '无效的状态流转',
    );
    expect(() => transitionStatus('pending', 'APPROVE')).toThrow(
      '无效的状态流转',
    );
    expect(() => transitionStatus('rejected', 'APPROVE')).toThrow(
      '无效的状态流转',
    );
  });
});

describe('canPerformAction', () => {
  const cases: { status: DocumentStatus; action: AuditAction; expected: boolean }[] = [
    { status: 'editing', action: 'SUBMIT_AUDIT', expected: true },
    { status: 'editing', action: 'APPROVE', expected: false },
    { status: 'pending', action: 'START_AUDIT', expected: true },
    { status: 'pending', action: 'REJECT', expected: false },
    { status: 'auditing', action: 'APPROVE', expected: true },
    { status: 'auditing', action: 'REJECT', expected: true },
    { status: 'auditing', action: 'START_AUDIT', expected: false },
    { status: 'approved', action: 'APPROVE', expected: false },
    { status: 'rejected', action: 'RE_EDIT', expected: true },
    { status: 'rejected', action: 'APPROVE', expected: false },
  ];

  it.each(cases)('$status + $action → $expected', ({ status, action, expected }) => {
    expect(canPerformAction(status, action)).toBe(expected);
  });
});
