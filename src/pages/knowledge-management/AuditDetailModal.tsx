import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  User,
  Calendar,
  Database,
  Settings2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { generateSimilarityResults, SIMILARITY_THRESHOLD } from '@/utils/similarityMock';
import { getKnowledgeBaseById } from '@/utils/knowledgeBaseStorage';
import { DOCUMENT_STATUS_LABEL } from '@/models/knowledgeBaseModel';
import type { KnowledgeDocument, DocumentChunk } from '@/models/knowledgeBaseModel';

interface AuditDetailModalProps {
  doc: KnowledgeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAudit?: (docId: string, action: 'APPROVE' | 'REJECT', reason?: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 左侧：文档信息面板 */
function DocInfoPanel({ doc }: { doc: KnowledgeDocument }) {
  const kb = getKnowledgeBaseById(doc.targetKnowledgeBaseId);
  const mockPageCount = Math.max(1, Math.floor(doc.fileSize / (50 * 1024)));

  const infoItems = [
    { icon: FileText, label: '文档名称', value: doc.name },
    { icon: FileText, label: '格式', value: doc.fileType.toUpperCase() },
    { icon: FileText, label: '大小', value: formatFileSize(doc.fileSize) },
    { icon: FileText, label: '页数', value: `${mockPageCount} 页` },
    { icon: User, label: '上传人', value: doc.uploader },
    { icon: Calendar, label: '上传时间', value: formatDate(doc.uploadTime) },
    { icon: Database, label: '目标知识库', value: kb?.name || doc.targetKnowledgeBaseId },
    { icon: FileText, label: '当前状态', value: DOCUMENT_STATUS_LABEL[doc.status] },
  ];

  const seg = doc.segmentConfig;
  const preprocessRules: string[] = [];
  if (seg.replaceWhitespace) preprocessRules.push('替换连续空白');
  if (seg.removeUrls) preprocessRules.push('删除 URL');

  return (
    <div className="space-y-5">
      <h3 className="text-[13px] font-semibold text-dark-text-primary flex items-center gap-1.5">
        <FileText className="w-4 h-4 text-dark-text-secondary" />
        文档信息
      </h3>
      <div className="space-y-3">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-start gap-2">
            <item.icon className="w-3.5 h-3.5 text-dark-text-secondary mt-0.5 shrink-0" />
            <div>
              <div className="text-[11px] text-dark-text-secondary">{item.label}</div>
              <div className="text-[12px] text-dark-text-primary">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-dark-border pt-4">
        <h3 className="text-[13px] font-semibold text-dark-text-primary flex items-center gap-1.5 mb-3">
          <Settings2 className="w-4 h-4 text-dark-text-secondary" />
          分段参数
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-dark-text-secondary">标识符</span>
            <span className="text-dark-text-primary font-mono">{seg.delimiter}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-dark-text-secondary">最大长度</span>
            <span className="text-dark-text-primary">{seg.maxLength}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-dark-text-secondary">重叠长度</span>
            <span className="text-dark-text-primary">{seg.overlapLength}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-dark-text-secondary">预处理</span>
            <span className="text-dark-text-primary">
              {preprocessRules.length > 0 ? preprocessRules.join('、') : '无'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 中间：预览块面板 */
function ChunkPreviewPanel({ chunks }: { chunks: DocumentChunk[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const displayChunks = chunks.slice(0, 20);
  const hasMore = chunks.length > 20;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-dark-text-primary flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-dark-text-secondary" />
          预览块
        </h3>
        <span className="text-[11px] text-dark-text-secondary">
          共 {chunks.length} 个分块{displayChunks.length < chunks.length ? `，展示前 ${displayChunks.length} 个` : ''}
        </span>
      </div>
      {displayChunks.length === 0 && (
        <div className="text-center text-dark-text-secondary text-[13px] py-8">
          暂无预览块数据
        </div>
      )}
      <div className="space-y-3">
        {displayChunks.map((chunk, index) => {
          const isExpanded = expandedIds.has(chunk.id);
          const previewText =
            chunk.content.length > 100 && !isExpanded
              ? chunk.content.slice(0, 100) + '...'
              : chunk.content;
          return (
            <div
              key={chunk.id}
              className="border border-dark-border rounded-lg p-3 bg-dark-page"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-dark-text-secondary">
                  分块 #{index + 1}
                </span>
                <span className="text-[11px] text-dark-text-secondary">
                  {chunk.charCount} 字符
                </span>
              </div>
              <p className="text-[12px] text-dark-text-primary leading-relaxed whitespace-pre-wrap">
                {previewText}
              </p>
              {chunk.content.length > 100 && (
                <button
                  onClick={() => toggleExpand(chunk.id)}
                  className="mt-2 text-[11px] text-dark-accent-primary hover:text-dark-accent-primary flex items-center gap-0.5"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      收起
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      展开
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center text-[11px] text-dark-text-secondary py-2">
          还有 {chunks.length - 20} 个分块未展示
        </div>
      )}
    </div>
  );
}

/** 右侧：相似度检测 + 审核操作面板 */
function AuditActionPanel({
  doc,
  onAudit,
  onClose,
}: {
  doc: KnowledgeDocument;
  onAudit?: (docId: string, action: 'APPROVE' | 'REJECT', reason?: string) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'idle' | 'confirm-approve' | 'reject-form'>('idle');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [compareDoc, setCompareDoc] = useState<{ docName: string; similarity: number } | null>(null);

  const results = useMemo(() => generateSimilarityResults(doc.id), [doc.id]);
  const highSimilarity = results.filter((r) => r.similarity >= SIMILARITY_THRESHOLD);
  const kb = getKnowledgeBaseById(doc.targetKnowledgeBaseId);

  function handleApprove() {
    onAudit?.(doc.id, 'APPROVE');
    onClose();
  }

  function handleRejectSubmit() {
    const trimmed = rejectReason.trim();
    if (trimmed.length < 5) {
      setRejectError('请填写至少 5 个字的审核意见');
      return;
    }
    onAudit?.(doc.id, 'REJECT', trimmed);
    onClose();
  }

  function cancelAction() {
    setMode('idle');
    setRejectReason('');
    setRejectError('');
  }

  return (
    <div className="space-y-5">
      <h3 className="text-[13px] font-semibold text-dark-text-primary">相似度检测</h3>

      {highSimilarity.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-[12px] text-yellow-800">
            <div className="font-medium mb-0.5">检测到高相似文档</div>
            {highSimilarity.map((r) => (
              <div key={r.docId}>
                与《{r.docName}》相似度 {r.similarity}%，建议合并或去重
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.docId} className="border border-dark-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-medium text-dark-text-primary truncate max-w-[140px]">
                {result.docName}
              </span>
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  result.similarity >= SIMILARITY_THRESHOLD
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {result.similarity}%
              </span>
            </div>
            <div className="text-[11px] text-dark-text-secondary mb-2">
              {result.knowledgeBaseName}
            </div>
            <button
              onClick={() => setCompareDoc({ docName: result.docName, similarity: result.similarity })}
              className="text-[11px] text-dark-accent-primary hover:text-dark-accent-primary"
            >
              查看对比
            </button>
          </div>
        ))}
      </div>

      {/* 查看对比内联展示 */}
      {compareDoc && (
        <div className="border border-dark-border rounded-lg p-3 bg-dark-page">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-dark-text-primary">文档对比</span>
            <button
              onClick={() => setCompareDoc(null)}
              className="text-[11px] text-dark-text-secondary hover:text-dark-text-primary"
            >
              关闭
            </button>
          </div>
          <div className="text-[11px] text-dark-text-secondary mb-2">
            当前文档：{doc.name}
            <br />
            对比文档：{compareDoc.docName}（相似度 {compareDoc.similarity}%）
          </div>
          <div className="bg-dark-elevated rounded border border-dark-border p-3 text-[12px] text-dark-text-secondary text-center">
            Demo 级别：文本对比功能将在后续版本实现
          </div>
        </div>
      )}

      {/* 审核操作区域 */}
      <div className="border-t border-dark-border pt-4">
        <h3 className="text-[13px] font-semibold text-dark-text-primary mb-3">审核操作</h3>

        {mode === 'idle' && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode('confirm-approve')}
              className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              通过并嵌入
            </button>
            <button
              onClick={() => setMode('reject-form')}
              className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center justify-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              审核不通过
            </button>
          </div>
        )}

        {mode === 'confirm-approve' && (
          <div className="space-y-3">
            <p className="text-[12px] text-dark-text-primary">
              确认通过并嵌入《{doc.name}》到《{kb?.name || doc.targetKnowledgeBaseId}》？
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-green-600 text-white hover:bg-green-700"
              >
                确认
              </button>
              <button
                onClick={cancelAction}
                className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {mode === 'reject-form' && (
          <div className="space-y-3">
            <div>
              <label className="text-[12px] text-dark-text-secondary block mb-1.5">
                审核不通过原因 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError('');
                }}
                placeholder="请填写至少 5 个字的审核意见"
                className="w-full text-[12px] border border-dark-border rounded-lg p-2.5 min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-[#3478f6]"
              />
              {rejectError && (
                <p className="text-[11px] text-red-600 mt-1">{rejectError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-red-600 text-white hover:bg-red-700"
              >
                确认
              </button>
              <button
                onClick={cancelAction}
                className="flex-1 px-3 py-2 rounded-lg text-[12px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditDetailModal({
  doc,
  open,
  onOpenChange,
  onAudit,
}: AuditDetailModalProps) {
  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[90vw] h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-dark-border shrink-0">
          <DialogTitle className="text-[15px] font-semibold">
            审核详情 — {doc.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[30%] border-r border-dark-border p-5 overflow-auto">
            <DocInfoPanel doc={doc} />
          </div>
          <div className="flex-1 border-r border-dark-border p-5 overflow-auto">
            <ChunkPreviewPanel chunks={doc.chunks} />
          </div>
          <div className="w-[30%] p-5 overflow-auto">
            <AuditActionPanel
              doc={doc}
              onAudit={onAudit}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
