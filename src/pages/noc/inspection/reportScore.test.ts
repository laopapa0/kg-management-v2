import { describe, it, expect } from 'vitest';
import { calculateReportValueScore } from './mockData';

describe('calculateReportValueScore', () => {
  it('例1: 12 项异常, 误报 1 项 → 96.7 分', () => {
    const result = calculateReportValueScore(12, 1 / 12, 5);
    expect(result.effectiveAnomalies).toBeCloseTo(11, 0);
    expect(result.detectionScore).toBe(1.0);
    expect(result.falsePositiveRate).toBeCloseTo(0.083, 2);
    expect(result.overall).toBeCloseTo(96.7, 1);
  });

  it('例2: 8 项异常, 误报 2 项 → 90 分 (targetValue=5)', () => {
    const result = calculateReportValueScore(8, 2 / 8, 5);
    expect(result.effectiveAnomalies).toBe(6);
    expect(result.detectionScore).toBe(1.0);
    expect(result.falsePositiveRate).toBe(0.25);
    expect(result.overall).toBeCloseTo(90, 0);
  });

  it('例3: 0 项异常 → 40 分', () => {
    const result = calculateReportValueScore(0, 0, 5);
    expect(result.effectiveAnomalies).toBe(0);
    expect(result.detectionScore).toBe(0);
    expect(result.falsePositiveRate).toBe(0);
    expect(result.overall).toBe(40);
  });

  it('超过目标值按封顶计: 20 项, 0 误报 → 100 分', () => {
    const result = calculateReportValueScore(20, 0, 5);
    expect(result.effectiveAnomalies).toBe(20);
    expect(result.detectionScore).toBe(1.0);
    expect(result.overall).toBe(100);
  });

  it('默认目标值为 5', () => {
    const result = calculateReportValueScore(5, 0);
    expect(result.detectionScore).toBe(1.0);
    expect(result.overall).toBeCloseTo(100, 0);
  });
});
