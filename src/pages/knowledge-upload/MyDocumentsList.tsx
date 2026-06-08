import { useState } from 'react';
import { getKnowledgeDocuments, createKnowledgeDocument } from '@/utils/knowledgeBaseStorage';
import { DOCUMENT_STATUS_LABEL, type DocumentStatus, type KnowledgeDocument } from '@/models/knowledgeBaseModel';
import { Eye, Edit, Upload, Loader2 } from 'lucide-react';
import DocumentDetailDrawer from './DocumentDetailDrawer';
import DocumentReeditForm from './DocumentReeditForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function mockSimilarityCheck(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.floor(Math.random() * 30) + 70), 1500)
  })
}

function generateId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface DocumentRowProps {
  doc: KnowledgeDocument;
  onView: (doc: KnowledgeDocument) => void;
  onReEdit?: (doc: KnowledgeDocument) => void;
  onImportVersion?: (doc: KnowledgeDocument) => void;
}

function DocumentRow({ doc, onView, onReEdit, onImportVersion }: DocumentRowProps) {
  const version = doc.version ?? 1

  return (
    <tr
      className="border-b border-dark-border last:border-b-0 hover:bg-dark-page cursor-pointer"
      onClick={() => onView(doc)}
      data-testid={`doc-row-${doc.id}`}
    >
      <td className="px-4 py-3 text-dark-text-primary">
        {doc.name}
        <span className="ml-2 text-xs text-dark-text-tertiary">v{version}</span>
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
            onClick={(e) => { e.stopPropagation(); onView(doc) }}
          >
            <Eye size={14} />查看
          </button>
          <button
            className="text-dark-text-secondary hover:text-dark-text-primary flex items-center gap-1"
            onClick={(e) => { e.stopPropagation(); onImportVersion?.(doc) }}
            data-testid={`doc-import-version-${doc.id}`}
          >
            <Upload size={14} />导入新版本
          </button>
          {doc.status === 'rejected' && onReEdit && (
            <button
              className="text-warning-500 flex items-center gap-1"
              onClick={(e) => { e.stopPropagation(); onReEdit(doc) }}
            >
              <Edit size={14} />重新编辑
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
  const [importDoc, setImportDoc] = useState<KnowledgeDocument | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  const sortedDocs = [...docs].sort(
    (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime(),
  );

  const handleView = (doc: KnowledgeDocument) => { setSelectedDoc(doc); setDrawerOpen(true) }
  const handleReEdit = (doc: KnowledgeDocument) => { setReeditDoc(doc); setReeditOpen(true) }

  const handleImportVersion = (doc: KnowledgeDocument) => {
    setImportDoc(doc); setImportOpen(true); setImportFile(null); setSimilarityScore(null); setChecking(false)
  }

  const handleStartCheck = async () => {
    if (!importFile || !importDoc) return
    setChecking(true)
    const score = await mockSimilarityCheck()
    setSimilarityScore(score)
    setChecking(false)
  }

  const handleConfirmImport = () => {
    if (!importDoc || !importFile || similarityScore === null) return
    const newVersion = (importDoc.version ?? 1) + 1
    const imported: KnowledgeDocument = {
      ...importDoc,
      id: generateId(),
      name: importFile.name,
      fileSize: importFile.size,
      fileType: importFile.name.split('.').pop() ?? '',
      uploadTime: new Date().toISOString(),
      status: 'editing',
      version: newVersion,
      similarityScore,
    }
    createKnowledgeDocument(imported)
    setDocs(getKnowledgeDocuments())
    setImportOpen(false)
  }

  const handleSubmitted = () => { setDocs(getKnowledgeDocuments()); setReeditDoc(null) }

  return (
    <div>
      <div className="bg-dark-elevated rounded-lg border border-dark-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-dark-border text-dark-text-secondary">
              <th className="text-left font-medium px-4 py-3">文档名称</th>
              <th className="text-left font-medium px-4 py-3">上传时间</th>
              <th className="text-left font-medium px-4 py-3">文件大小</th>
              <th className="text-left font-medium px-4 py-3">状态</th>
              <th className="text-left font-medium px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedDocs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-dark-text-secondary py-12">暂无文档，请先上传</td>
              </tr>
            )}
            {sortedDocs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onView={handleView} onReEdit={handleReEdit} onImportVersion={handleImportVersion} />
            ))}
          </tbody>
        </table>
      </div>

      <DocumentDetailDrawer doc={selectedDoc} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <DocumentReeditForm doc={reeditDoc} open={reeditOpen} onOpenChange={setReeditOpen} onSubmitted={handleSubmitted} />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="bg-dark-card-l1 text-dark-text-primary">
          <DialogHeader>
            <DialogTitle>导入新版本</DialogTitle>
            <DialogDescription className="text-dark-text-secondary">
              替换「{importDoc?.name}」v{importDoc?.version ?? 1} → v{(importDoc?.version ?? 1) + 1}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>选择新文件</Label>
              <Input
                type="file"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="mt-1 bg-dark-card-l2"
              />
            </div>
            {checking && (
              <div className="flex items-center gap-2 text-dark-text-secondary">
                <Loader2 className="size-4 animate-spin" />正在审查相似度...
              </div>
            )}
            {similarityScore !== null && (
              <div className="rounded-md bg-dark-card-l2 p-3 text-sm">
                相似度审查完成：
                <span className="font-semibold text-dark-text-primary ml-1">{similarityScore}%</span>
                <span className="ml-2 text-dark-text-secondary">
                  {similarityScore >= 90 ? '(高度相似，可以替换)' : similarityScore >= 75 ? '(部分相似，请确认)' : '(差异较大，请确认)'}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} className="border-dark-border">取消</Button>
            {!similarityScore ? (
              <Button onClick={handleStartCheck} disabled={!importFile || checking}>审查相似度</Button>
            ) : (
              <Button onClick={handleConfirmImport}>确认替换</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
