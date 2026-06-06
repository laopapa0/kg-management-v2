import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('dark-theme.css', () => {
  const cssPath = path.resolve(__dirname, 'dark-theme.css');
  const css = () => fs.readFileSync(cssPath, 'utf-8');

  it('存在 src/styles/dark-theme.css 文件', () => {
    expect(fs.existsSync(cssPath)).toBe(true);
  });

  it('在 [data-theme="dark"] 下定义页面背景和主文字变量', () => {
    const content = css();

    expect(content).toMatch(/\[data-theme=["']dark["']\]/);
    expect(content).toContain('--dark-bg-page: #0F141F');
    expect(content).toContain('--dark-text-primary: #E8ECF1');
  });

  it('至少包含 39 个 --dark-* CSS 变量', () => {
    const content = css();
    const matches = content.match(/--dark-[\w-]+:/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(39);
  });

  it('覆盖 bg、card、text、accent、border、status、conn、tree 八大系列', () => {
    const content = css();
    const prefixes = ['bg', 'card', 'text', 'accent', 'border', 'status', 'conn', 'tree'];

    for (const prefix of prefixes) {
      expect(content).toMatch(new RegExp(`--dark-${prefix}-[\\w-]+:`));
    }
  });
});
