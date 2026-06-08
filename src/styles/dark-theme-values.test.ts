import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function parseCssVariables(css: string, selector: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const startIdx = css.indexOf(selector);
  if (startIdx === -1) return vars;
  const blockStart = css.indexOf('{', startIdx);
  const blockEnd = css.indexOf('}', blockStart);
  const block = css.slice(blockStart + 1, blockEnd);
  const regex = /(--dark-[\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(block)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

describe('dark-theme.css variable values', () => {
  const cssPath = path.resolve(__dirname, 'dark-theme.css');
  const css = fs.readFileSync(cssPath, 'utf-8');
  const vars = parseCssVariables(css, '[data-theme="dark"]');

  it('--dark-bg-page 为 #0F141F', () => {
    expect(vars['--dark-bg-page']).toBe('#0F141F');
  });

  it('--dark-text-primary 为 #E8ECF1', () => {
    expect(vars['--dark-text-primary']).toBe('#E8ECF1');
  });

  it('--dark-accent-primary 为 #5B8DEF', () => {
    expect(vars['--dark-accent-primary']).toBe('#5B8DEF');
  });

  it('--dark-status-success-active 为高饱和 #22C55E', () => {
    expect(vars['--dark-status-success-active']).toBe('#22C55E');
  });

  it('--dark-conn-spotlight 为 45% 透明度遮罩', () => {
    expect(vars['--dark-conn-spotlight']).toBe('rgba(15, 23, 42, 0.45)');
  });
});
