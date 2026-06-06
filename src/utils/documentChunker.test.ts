import { describe, it, expect } from 'vitest';
import { documentChunker } from './documentChunker';
import type { SegmentConfig } from '@/models/knowledgeBaseModel';

const defaultConfig: SegmentConfig = {
  delimiter: '\\n\\n',
  maxLength: 100,
  overlapLength: 10,
  replaceWhitespace: false,
  removeUrls: false,
};

describe('documentChunker', () => {
  it('空文本 → 返回空数组', () => {
    const result = documentChunker('', defaultConfig);
    expect(result).toEqual([]);
  });

  it('标准分段 — 按标识符切分，每块不超过 maxLength', () => {
    const text = '第一段内容\n\n第二段内容更长一些\n\n第三段';
    const result = documentChunker(text, { ...defaultConfig, maxLength: 50 });
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result[0].content).toBe('第一段内容');
    expect(result[0].charCount).toBe(5);
    expect(result.every((c) => c.content.length <= 50)).toBe(true);
    expect(result.every((c) => c.id.startsWith('chunk-'))).toBe(true);
  });

  it('强制切分块间重叠 — 相邻块共享 overlapLength 字符', () => {
    const text = 'A'.repeat(250);
    const result = documentChunker(text, {
      ...defaultConfig,
      maxLength: 100,
      overlapLength: 10,
    });
    expect(result.length).toBeGreaterThanOrEqual(3);
    // chunk-0: 0-100, chunk-1: 90-190 (overlap 10), chunk-2: 180-250
    expect(result[0].content).toBe('A'.repeat(100));
    expect(result[1].content).toBe('A'.repeat(100));
    expect(result[2].content).toBe('A'.repeat(70));
  });

  it('超长段落强制切分 — 单段超过 maxLength 时分块', () => {
    const text = 'A'.repeat(250);
    const result = documentChunker(text, { ...defaultConfig, maxLength: 100, overlapLength: 0 });
    expect(result.length).toBe(3);
    expect(result[0].content).toBe('A'.repeat(100));
    expect(result[1].content).toBe('A'.repeat(100));
    expect(result[2].content).toBe('A'.repeat(50));
  });

  it('无匹配标识符 — 整段按 maxLength 强制切分', () => {
    const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = documentChunker(text, {
      ...defaultConfig,
      delimiter: '###',
      maxLength: 10,
      overlapLength: 0,
    });
    expect(result.length).toBe(3);
    expect(result[0].content).toBe('ABCDEFGHIJ');
    expect(result[1].content).toBe('KLMNOPQRST');
    expect(result[2].content).toBe('UVWXYZ');
  });

  it('overlap > maxLength 时边界保护', () => {
    const text = 'A'.repeat(30);
    const result = documentChunker(text, {
      ...defaultConfig,
      maxLength: 10,
      overlapLength: 20, // > maxLength/2
    });
    // overlap 被限制为 5 (maxLength/2)，step = 5
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((c) => c.content.length <= 10)).toBe(true);
  });

  it('预处理 — 替换连续空白', () => {
    const text = '段落1\n\n\n段落2   很多空格';
    const result = documentChunker(text, {
      ...defaultConfig,
      replaceWhitespace: true,
      maxLength: 100,
    });
    // 替换后 \n\n\n 变成 \n\n（分隔符），多余空格变成一个
    const allContent = result.map((c) => c.content).join('');
    expect(allContent).not.toMatch(/[\t\n]{3,}/);
    expect(allContent).not.toMatch(/ {2,}/);
  });

  it('预处理 — 删除 URL', () => {
    const text = '查看文档 https://example.com/doc 获取更多信息';
    const result = documentChunker(text, {
      ...defaultConfig,
      removeUrls: true,
      maxLength: 100,
    });
    const allContent = result.map((c) => c.content).join('');
    expect(allContent).not.toContain('https://example.com/doc');
  });
});
