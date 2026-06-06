import type { SegmentConfig, DocumentChunk } from '@/models/knowledgeBaseModel';

export function documentChunker(
  text: string,
  config: SegmentConfig,
): DocumentChunk[] {
  if (!text.trim()) return [];

  // 边界保护：overlap 不能超过 maxLength 的一半
  const overlap = Math.min(config.overlapLength, Math.floor(config.maxLength / 2));

  // 预处理
  let processed = text;
  if (config.replaceWhitespace) {
    processed = processed.replace(/[\s]+/g, ' ');
  }
  if (config.removeUrls) {
    processed = processed.replace(/https?:\/\/\S+/g, '');
  }

  const chunks: DocumentChunk[] = [];
  // 将转义的分隔符转换为真实字符
  const realDelimiter = config.delimiter.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  const segments = processed.split(realDelimiter).filter((s) => s.trim());

  for (const segment of segments) {
    if (segment.length <= config.maxLength) {
      chunks.push({
        id: `chunk-${chunks.length}`,
        content: segment.trim(),
        charCount: segment.trim().length,
      });
    } else {
      // 超长段落：滑动窗口切分，带重叠
      for (let start = 0; start < segment.length; start += config.maxLength - overlap) {
        const piece = segment.slice(start, start + config.maxLength);
        chunks.push({
          id: `chunk-${chunks.length}`,
          content: piece,
          charCount: piece.length,
        });
        if (start + config.maxLength >= segment.length) break;
      }
    }
  }

  return chunks;
}
