import { useState } from 'react';
import { getKnowledgeDocuments, getKnowledgeBaseById } from '@/utils/knowledgeBaseStorage';
import { DOCUMENT_STATUS_LABEL, type DocumentStatus, type KnowledgeDocument } from '@/models/knowledgeBaseModel';
import { Eye, Edit } from 'lucide-react';
import DocumentDetailDrawer from './DocumentDetailDrawer';
import DocumentReeditForm from './DocumentReeditForm';

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

interface DocumentRowProps {
  doc: KnowledgeDocument;
  onView: (doc: KnowledgeDocument) => void;
  onReEdit?: (doc: KnowledgeDocument) => void;
}

function DocumentRow({ doc, onView, onReEdit }: DocumentRowProps) {
  const kb = getKnowledgeBaseById(doc.targetKnowledgeBaseId);

  return (
    <tr
      className="border-b border-dark-border last:border-b-0 hover:bg-dark-page cursor-pointer"
      onClick={() => onView(doc)}
      data-testid={`doc-row-${doc.id}`}
    >
      <td className="px-4 py-3 text-dark-text-primary">{doc.name}</td>
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
        <div className="flex items-center gap-3">
          <button
            className="text-dark-accent-primary hover:text-dark-accent-primary flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onView(doc);
            }}
          >
            <Eye size={14} />
            查看
          </button>
          {doc.status === 'rejected' && onReEdit && (
            <button
              className="text-warning-500 hover:text-warning-600 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onReEdit(doc);
              }}
            >
              <Edit size={14} />
              重新编辑
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function MyDocumentsList() {
  const [docs, setDocs] = useState(() => getKnowledgeDocuments());
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reeditDoc, setReeditDoc] = useState<KnowledgeDocument | null>(null);
  const [reeditOpen, setReeditOpen] = useState(false);

  const sortedDocs = [...docs].sort(
    (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime(),
  );

  const handleView = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setDrawerOpen(true);
  };

  const handleReEdit = (doc: KnowledgeDocument) => {
    setReeditDoc(doc);
    setReeditOpen(true);
  };

  const handleSubmitted = () => {
    setDocs(getKnowledgeDocuments());
    setReeditDoc(null);
  };

  return (
    <div>
      <div className="bg-dark-elevated rounded-lg border border-dark-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-dark-border text-dark-text-secondary">
              <th className="text-left font-medium px-4 py-3">文档名称</th>
              <th className="text-left font-medium px-4 py-3">目标知识库</th>
              <th className="text-left font-medium px-4 py-3">上传时间</th>
              <th className="text-left font-medium px-4 py-3">文件大小</th>
              <th className="text-left font-medium px-4 py-3">状态</th>
              <th className="text-left font-medium px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-dark-text-secondary py-12">
                  暂无文档，请先上传
                </td>
              </tr>
            )}
            {sortedDocs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onView={handleView} onReEdit={handleReEdit} />
            ))}
          </tbody>
        </table>
      </div>

      <DocumentDetailDrawer
        doc={selectedDoc}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <DocumentReeditForm
        doc={reeditDoc}
        open={reeditOpen}
        onOpenChange={setReeditOpen}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}
