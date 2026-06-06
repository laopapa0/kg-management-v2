/**
 * 相似度检测 Mock 数据
 *
 * Demo 级别：固定返回预设的相似文档列表，不依赖真实算法
 */

export interface SimilarityResult {
  docId: string;
  docName: string;
  knowledgeBaseName: string;
  similarity: number; // 0-100
}

/** 相似度告警阈值 */
export const SIMILARITY_THRESHOLD = 80;

/** 生成 mock 相似度检测结果 */
export function generateSimilarityResults(_docId: string): SimilarityResult[] {
  return [
    {
      docId: 'sim-1',
      docName: '5G网络建设规范v2.pdf',
      knowledgeBaseName: '默认业务知识库',
      similarity: 85,
    },
    {
      docId: 'sim-2',
      docName: '移动通信技术白皮书.docx',
      knowledgeBaseName: '5G业务知识库',
      similarity: 75,
    },
    {
      docId: 'sim-3',
      docName: '无线网络优化指南.pdf',
      knowledgeBaseName: '默认业务知识库',
      similarity: 62,
    },
  ];
}
