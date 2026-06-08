import { useState, useMemo, useCallback } from 'react';
import {
  getKnowledgeDocuments,
  getKnowledgeBases,
  getKnowledgeBaseById,
  auditKnowledgeDocument,
  updateKnowledgeDocument,
} from '@/utils/knowledgeBaseStorage';
import { DOCUMENT_STATUS_LABEL, type DocumentStatus, type KnowledgeDocument } from '@/models/knowledgeBaseModel';
import { transitionStatus } from '@/utils/knowledgeBaseStateMachine';
import { toast } from 'sonner';
import AuditDetailModal from './AuditDetailModal';

const STATUS_COLORS: Record<DocumentStatus, string> = {
  editing: 'bg-gray-100 text-gray-700',
  pending: 'bg-blue-100 text-blue-700',
  auditing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type TimeRange = 'all' | '7d' | '30d';

export interface FilterConfig {
  kbFilter: string;
  statusFilter: string;
  timeFilter: TimeRange;
}

/** 纯函数：根据筛选条件过滤文档列表 */
export function filterDocuments(
  docs: KnowledgeDocument[],
  config: FilterConfig,
): KnowledgeDocument[] {
  let result = [...docs];

  if (config.kbFilter !== 'all') {
    result = result.filter((d) => d.targetKnowledgeBaseId === config.kbFilter);
  }

  if (config.statusFilter !== 'all') {
    result = result.filter((d) => d.status === config.statusFilter);
  }

  if (config.timeFilter !== 'all') {
    const now = Date.now();
    const days = config.timeFilter === '7d' ? 7 : 30;
    const threshold = now - days * 24 * 60 * 60 * 1000;
    result = result.filter((d) => new Date(d.uploadTime).getTime() >= threshold);
  }

  return result.sort(
    (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime(),
  );
}

interface AuditRowProps {
  doc: KnowledgeDocument;
  onOpenDetail: (doc: KnowledgeDocument) => void;
}

function AuditRow({ doc, onOpenDetail }: AuditRowProps) {
  const kb = getKnowledgeBaseById(doc.targetKnowledgeBaseId);

  return (
    <tr className="border-b border-dark-border last:border-b-0 hover:bg-dark-page">
      <td className="px-4 py-3 text-dark-text-primary">{doc.name}</td>
      <td className="px-4 py-3 text-dark-text-secondary">{doc.uploader}</td>
      <td className="px-4 py-3 text-dark-text-secondary">
        {kb?.name || doc.targetKnowledgeBaseId}
      </td>
      <td className="px-4 py-3 text-dark-text-secondary">
        {new Date(doc.uploadTime).toLocaleDateString('zh-CN')}
      </td>
      <td className="px-4 py-3 text-dark-text-secondary">
        {formatFileSize(doc.fileSize)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_COLORS[doc.status]}`}
        >
          {DOCUMENT_STATUS_LABEL[doc.status]}
        </span>
      </td>
      <td className="px-4 py-3">
        {doc.status === 'pending' || doc.status === 'auditing' ? (
          <button
            onClick={() => onOpenDetail(doc)}
            className="text-[13px] text-dark-accent-primary hover:text-dark-accent-primary font-medium"
          >
            审核
          </button>
        ) : (
          <button
            onClick={() => onOpenDetail(doc)}
            className="text-[13px] text-dark-text-secondary hover:text-dark-text-primary"
          >
            查看
          </button>
        )}
      </td>
    </tr>
  );
}

export default function KnowledgeAuditList() {
  const [refreshKey, setRefreshKey] = useState(0);
  const docs = useMemo(() => {
    void refreshKey;
    return getKnowledgeDocuments();
  }, [refreshKey]);
  const bases = getKnowledgeBases();

  const [kbFilter, setKbFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeRange>('all');
  const [detailDoc, setDetailDoc] = useState<KnowledgeDocument | null>(null);

  const filteredDocs = useMemo(
    () => filterDocuments(docs, { kbFilter, statusFilter, timeFilter }),
    [docs, kbFilter, statusFilter, timeFilter],
  );

  const handleOpenDetail = useCallback(
    (doc: KnowledgeDocument) => {
      // pending 文档打开时自动转为 auditing
      if (doc.status === 'pending') {
        try {
          const result = transitionStatus(doc.status, 'START_AUDIT');
          updateKnowledgeDocument(doc.id, {
            name: doc.name,
            fileSize: doc.fileSize,
            status: result.status,
            segmentConfig: doc.segmentConfig,
            fileType: doc.fileType,
          });
          setRefreshKey((k) => k + 1);
          // 重新获取更新后的文档
          const updatedDocs = getKnowledgeDocuments();
          const updated = updatedDocs.find((d) => d.id === doc.id);
          setDetailDoc(updated || doc);
          return;
        } catch {
          // 如果状态转换失败，直接打开原文档
        }
      }
      setDetailDoc(doc);
    },
    [],
  );

  const handleAudit = useCallback(
    (docId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
      const auditor = 'NOC审核员';
      const result = transitionStatus('auditing', action, { auditor, reason });
      auditKnowledgeDocument(docId, {
        status: result.status,
        auditRecord: result.auditRecord!,
      });
      setRefreshKey((k) => k + 1);
      toast.success(
        action === 'APPROVE' ? '审核已通过并嵌入' : '审核已驳回',
      );
    },
    [],
  );

  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="bg-dark-elevated rounded-lg border border-dark-border p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="kb-filter" className="text-[13px] text-dark-text-secondary">
            知识库
          </label>
          <select
            id="kb-filter"
            aria-label="知识库"
            className="text-[13px] border border-dark-border rounded-md px-3 py-1.5 bg-dark-elevated"
            value={kbFilter}
            onChange={(e) => setKbFilter(e.target.value)}
          >
            <option value="all">全部</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-[13px] text-dark-text-secondary">
            状态
          </label>
          <select
            id="status-filter"
            aria-label="状态"
            className="text-[13px] border border-dark-border rounded-md px-3 py-1.5 bg-dark-elevated"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="pending">待审核</option>
            <option value="auditing">审核中</option>
            <option value="approved">已通过</option>
            <option value="rejected">审核不通过</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="time-filter" className="text-[13px] text-dark-text-secondary">
            时间范围
          </label>
          <select
            id="time-filter"
            aria-label="时间范围"
            className="text-[13px] border border-dark-border rounded-md px-3 py-1.5 bg-dark-elevated"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeRange)}
          >
            <option value="all">全部</option>
            <option value="7d">近7天</option>
            <option value="30d">近30天</option>
          </select>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-dark-elevated rounded-lg border border-dark-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-dark-border text-dark-text-secondary">
              <th className="text-left font-medium px-4 py-3">文档名称</th>
              <th className="text-left font-medium px-4 py-3">上传人</th>
              <th className="text-left font-medium px-4 py-3">目标知识库</th>
              <th className="text-left font-medium px-4 py-3">上传时间</th>
              <th className="text-left font-medium px-4 py-3">文件大小</th>
              <th className="text-left font-medium px-4 py-3">状态</th>
              <th className="text-left font-medium px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-dark-text-secondary py-12">
                  暂无符合条件的文档
                </td>
              </tr>
            )}
            {filteredDocs.map((doc) => (
              <AuditRow key={doc.id} doc={doc} onOpenDetail={handleOpenDetail} />
            ))}
          </tbody>
        </table>
      </div>

      <AuditDetailModal
        doc={detailDoc}
        open={!!detailDoc}
        onOpenChange={(open) => {
          if (!open) setDetailDoc(null);
        }}
        onAudit={handleAudit}
      />
    </div>
  );
}
