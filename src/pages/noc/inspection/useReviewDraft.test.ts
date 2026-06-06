import { describe, it, expect, beforeEach } from 'vitest';
import { useReviewDraft } from './useReviewDraft';

describe('useReviewDraft', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('save then load returns same evaluations', () => {
    const { save, load } = useReviewDraft();
    const data = {
      a1: { isFalsePositive: false, comment: '正常波动' },
      a2: { isFalsePositive: true },
    };
    save('report-1', data);
    expect(load('report-1')).toEqual(data);
  });

  it('load non-existent report returns empty object', () => {
    const { load } = useReviewDraft();
    expect(load('report-x')).toEqual({});
  });

  it('clear removes saved data', () => {
    const { save, load, clear } = useReviewDraft();
    save('report-1', { a1: { isFalsePositive: false } });
    clear('report-1');
    expect(load('report-1')).toEqual({});
  });

  it('reports are isolated by reportId', () => {
    const { save, load } = useReviewDraft();
    save('report-1', { a1: { isFalsePositive: false } });
    save('report-2', { a2: { isFalsePositive: true } });
    expect(load('report-1')).toEqual({ a1: { isFalsePositive: false } });
    expect(load('report-2')).toEqual({ a2: { isFalsePositive: true } });
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('inspection-review-report-bad', 'not-json');
    const { load } = useReviewDraft();
    expect(load('report-bad')).toEqual({});
  });
});
