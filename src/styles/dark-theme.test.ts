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

  it('包含 prefers-reduced-motion 媒体查询降级规则', () => {
    const content = css();
    expect(content).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('reduced-motion 下取消自定义动画', () => {
    const content = css();
    const idx = content.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    // Extract the full media block by counting braces
    let depth = 0;
    let start = -1;
    for (let i = idx; i < content.length; i++) {
      if (content[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          const block = content.slice(start + 1, i);
          expect(block).toContain('animation-duration: 0.01ms');
          expect(block).toContain('animation-iteration-count: 1');
          return;
        }
      }
    }
    throw new Error('Failed to parse media block');
  });

  it('reduced-motion 下保留功能性颜色/透明度过渡', () => {
    const content = css();
    const idx = content.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    let depth = 0;
    let start = -1;
    for (let i = idx; i < content.length; i++) {
      if (content[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          const block = content.slice(start + 1, i);
          expect(block).toContain('transition-colors');
          expect(block).toContain('transition-opacity');
          expect(block).toContain('transition-duration: 100ms');
          return;
        }
      }
    }
    throw new Error('Failed to parse media block');
  });

  it('reduced-motion 下限制 transition-all 为功能性属性', () => {
    const content = css();
    const idx = content.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    let depth = 0;
    let start = -1;
    for (let i = idx; i < content.length; i++) {
      if (content[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          const block = content.slice(start + 1, i);
          expect(block).toMatch(/transition-property:\s*color/);
          expect(block).toContain('opacity');
          return;
        }
      }
    }
    throw new Error('Failed to parse media block');
  });

  it('reduced-motion 下取消 transform 过渡', () => {
    const content = css();
    const idx = content.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    let depth = 0;
    let start = -1;
    for (let i = idx; i < content.length; i++) {
      if (content[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          const block = content.slice(start + 1, i);
          expect(block).toContain('.transition-transform');
          expect(block).toContain('transition-duration: 0ms');
          return;
        }
      }
    }
    throw new Error('Failed to parse media block');
  });
});
