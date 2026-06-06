import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateReportStatus,
  computeFalsePositiveRate,
  type AnomalyItem,
} from './mockData';

describe('evaluateReportStatus', () => {
  const anomalies: AnomalyItem[] = [
    { id: 'a1', indicatorId: 'IND-001', indicatorName: '指标A', indicatorCode: 'C001', currentValue: 10, deviation: 5, hitRules: [] },
    { id: 'a2', indicatorId: 'IND-002', indicatorName: '指标B', indicatorCode: 'C002', currentValue: 20, deviation: 10, hitRules: [] },
    { id: 'a3', indicatorId: 'IND-003', indicatorName: '指标C', indicatorCode: 'C003', currentValue: 30, deviation: 15, hitRules: [] },
  ];

  it('全部未评价 → pending', () => {
    const result = evaluateReportStatus(anomalies, {});
    expect(result.status).toBe('pending');
    expect(result.evaluatedCount).toBe(0);
    expect(result.totalCount).toBe(3);
  });

  it('部分已评价 → pending', () => {
    const result = evaluateReportStatus(anomalies, { a1: { isFalsePositive: false } });
    expect(result.status).toBe('pending');
    expect(result.evaluatedCount).toBe(1);
    expect(result.totalCount).toBe(3);
  });

  it('全部已评价（草稿状态）→ saved', () => {
    const result = evaluateReportStatus(anomalies, {
      a1: { isFalsePositive: false },
      a2: { isFalsePositive: true },
      a3: { isFalsePositive: false },
    });
    expect(result.status).toBe('saved');
    expect(result.evaluatedCount).toBe(3);
    expect(result.totalCount).toBe(3);
  });

  it('空异常列表 → pending', () => {
    const result = evaluateReportStatus([], {});
    expect(result.status).toBe('pending');
    expect(result.evaluatedCount).toBe(0);
    expect(result.totalCount).toBe(0);
  });
});

describe('computeFalsePositiveRate', () => {
  it('全误报 → 1.0', () => {
    const result = computeFalsePositiveRate({
      a1: { isFalsePositive: true },
      a2: { isFalsePositive: true },
    });
    expect(result).toBe(1);
  });

  it('全非误报 → 0.0', () => {
    const result = computeFalsePositiveRate({
      a1: { isFalsePositive: false },
      a2: { isFalsePositive: false },
    });
    expect(result).toBe(0);
  });

  it('混合 → 误报数/总数', () => {
    const result = computeFalsePositiveRate({
      a1: { isFalsePositive: false },
      a2: { isFalsePositive: true },
      a3: { isFalsePositive: false },
    });
    expect(result).toBeCloseTo(0.333, 2);
  });

  it('空评价 → 0', () => {
    expect(computeFalsePositiveRate({})).toBe(0);
  });
});
