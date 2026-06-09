/**
 * 知识库管理数据模型
 *
 * @see PRD #40: 知识库管理：文档上传 → NOC 审核 → 嵌入全流程
 */

/** 知识库类型 */
export type KnowledgeBaseType = 'default' | 'professional';

/** 文档审核状态 */
export type DocumentStatus =
  | 'editing'
  | 'pending'
  | 'auditing'
  | 'approved'
  | 'rejected';

/** 知识库实体 */
export interface KnowledgeBase {
  id: string;
  name: string;
  type: KnowledgeBaseType;
  description: string;
  createdAt: string;
  documentCount: number;
}

/** 文档分段块 */
export interface DocumentChunk {
  id: string;
  content: string;
  charCount: number;
}

/** 分段参数配置 */
export interface SegmentConfig {
  delimiter: string;
  maxLength: number;
  overlapLength: number;
  replaceWhitespace: boolean;
  removeUrls: boolean;
}

/** 审核记录 */
export interface AuditRecord {
  status: 'approved' | 'rejected';
  auditor: string;
  auditTime: string;
  reason: string;
}

/** 知识文档实体 */
export interface KnowledgeDocument {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  targetKnowledgeBaseId: string;
  uploader: string;
  uploadTime: string;
  status: DocumentStatus;
  segmentConfig: SegmentConfig;
  chunks: DocumentChunk[];
  /** 审核历史记录（支持多次审核） */
  auditRecords?: AuditRecord[];
  /** 版本号，默认 1 */
  version?: number;
  /** 相似度评分 (0-100)，新版本导入时记录 */
  similarityScore?: number;
}

/** 默认分段参数 */
export const DEFAULT_SEGMENT_CONFIG: SegmentConfig = {
  delimiter: '\\n\\n',
  maxLength: 1024,
  overlapLength: 50,
  replaceWhitespace: true,
  removeUrls: false,
};

/** 文档状态显示映射 */
export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  editing: '编辑中',
  pending: '已上传',
  auditing: '审核中',
  approved: '已通过',
  rejected: '审核不通过',
};

/** 支持的文件类型列表 */
export const SUPPORTED_FILE_TYPES = [
  'pdf',
  'docx',
  'md',
  'txt',
  'xml',
  'csv',
  'pptx',
  'xlsx',
  'htm',
];

/** 最大文件大小（字节） */
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
