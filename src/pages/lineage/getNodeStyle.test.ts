import { describe, it, expect } from 'vitest';
import { getNodeStyle } from './getNodeStyle';

describe('getNodeStyle', () => {
  it('returns red colors for root role', () => {
    const style = getNodeStyle('root');
    expect(style.borderColor).toBe('#dc2626');
    expect(style.bgColor).toBe('#450a0a');
  });

  it('returns orange colors for anomaly role', () => {
    const style = getNodeStyle('anomaly');
    expect(style.borderColor).toBe('#f59e0b');
    expect(style.bgColor).toBe('#451a03');
  });

  it('returns purple colors for affected role', () => {
    const style = getNodeStyle('affected');
    expect(style.borderColor).toBe('#7c5cfc');
    expect(style.bgColor).toBe('#2e1065');
  });

  it('returns green colors for normal role', () => {
    const style = getNodeStyle('normal');
    expect(style.borderColor).toBe('#10b981');
    expect(style.bgColor).toBe('#064e3b');
  });

  it('returns default gray colors for unknown role', () => {
    const style = getNodeStyle('unknown');
    expect(style.borderColor).toBe('#9ba4b3');
    expect(style.bgColor).toBe('#1e293b');
  });
});
