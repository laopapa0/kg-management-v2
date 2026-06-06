import type { EvaluationMap } from './mockData';

const STORAGE_KEY_PREFIX = 'inspection-review-';

export function useReviewDraft() {
  const load = (reportId: string): EvaluationMap => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${reportId}`);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  };

  const save = (reportId: string, evaluations: EvaluationMap): void => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${reportId}`, JSON.stringify(evaluations));
    } catch {
      // localStorage 满或禁用时静默失败
    }
  };

  const clear = (reportId: string): void => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${reportId}`);
  };

  return { load, save, clear };
}
