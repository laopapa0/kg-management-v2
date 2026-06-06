import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X } from 'lucide-react';
import { updateKnowledgeDocument } from '@/utils/knowledgeBaseStorage';
import { documentChunker } from '@/utils/documentChunker';
import {
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  type SegmentConfig,
  type KnowledgeDocument,
  type DocumentChunk,
} from '@/models/knowledgeBaseModel';

interface DocumentReeditFormProps {
  doc: KnowledgeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

export default function DocumentReeditForm({
  doc,
  open,
  onOpenChange,
  onSubmitted,
}: DocumentReeditFormProps) {
  const [segmentConfig, setSegmentConfig] = useState<SegmentConfig>({
    delimiter: '\\n\\n',
    maxLength: 1024,
    overlapLength: 50,
    replaceWhitespace: true,
    removeUrls: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [previewChunks, setPreviewChunks] = useState<DocumentChunk[]>([]);
  const [dialogError, setDialogError] = useState('');

  // Reset when doc changes
  useEffect(() => {
    if (doc) {
      setSegmentConfig(doc.segmentConfig);
      setSelectedFile(null);
      setFileError('');
      setPreviewChunks([]);
      setDialogError('');
    }
  }, [doc?.id]);

  const updateConfig = useCallback(
    (key: keyof SegmentConfig, value: string | number | boolean) => {
      setSegmentConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileError('');
      setPreviewChunks([]);
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!SUPPORTED_FILE_TYPES.includes(ext)) {
        setFileError('不支持的文件格式');
        setSelectedFile(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError('文件过大，请上传不超过 15MB 的文件');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    },
    [],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileError('');
    setPreviewChunks([]);
  }, []);

  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(String(e.target?.result || ''));
      };
      reader.readAsText(file);
    });
  };

  const handlePreviewChunks = useCallback(async () => {
    if (!selectedFile) {
      setDialogError('请先上传文件');
      return;
    }
    const text = await readFileText(selectedFile);
    const chunks = documentChunker(text, segmentConfig);
    setPreviewChunks(chunks.slice(0, 5));
  }, [selectedFile, segmentConfig]);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile || !doc) {
      setDialogError('请先上传文件');
      return;
    }

    const text = await readFileText(selectedFile);
    const chunks = documentChunker(text, segmentConfig);

    if (chunks.length > 100) {
      setDialogError('分块过细，建议增大分段最大长度');
      return;
    }
    const hasOversized = chunks.some(
      (c) => c.content.length > segmentConfig.maxLength * 2,
    );
    if (hasOversized) {
      setDialogError('存在超长段落，建议调整分段标识符');
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    updateKnowledgeDocument(doc.id, {
      name: selectedFile.name,
      fileType: ext,
      fileSize: selectedFile.size,
      status: 'pending',
      segmentConfig,
      targetKnowledgeBaseId: doc.targetKnowledgeBaseId,
    });

    setSelectedFile(null);
    setPreviewChunks([]);
    setDialogError('');
    onOpenChange(false);
    onSubmitted();
  }, [selectedFile, segmentConfig, doc, onOpenChange, onSubmitted]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>重新编辑审核不通过的文档</DialogTitle>
          <DialogDescription>
            文档：{doc.name} · 保留原分段参数，需重新上传文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 文件上传 */}
          <div className="bg-white rounded-lg border border-[#e8ecf1] p-5">
            <h3 className="text-[15px] font-semibold text-[#1a202c] mb-4">
              重新上传文件
            </h3>

            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e8ecf1] rounded-lg cursor-pointer hover:border-[#3478f6] hover:bg-[#f8f9fb] transition-colors">
                <Upload size={24} className="text-[#9ba4b3] mb-2" />
                <span className="text-[13px] text-[#6b7789]">
                  点击或拖拽上传文件
                </span>
                <span className="text-[11px] text-[#9ba4b3] mt-1">
                  支持 PDF/DOCX/MD/TXT/XML/CSV/PPTX/XLSX/HTM，≤15MB
                </span>
                <input
                  data-testid="reedit-file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-[#f8f9fb] rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[#1a202c]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-[#9ba4b3]">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                  <X size={16} />
                </Button>
              </div>
            )}

            {fileError && (
              <p className="text-[12px] text-red-500 mt-2">{fileError}</p>
            )}
          </div>

          {/* 分段设置 */}
          <div className="bg-white rounded-lg border border-[#e8ecf1] p-5">
            <h3 className="text-[15px] font-semibold text-[#1a202c] mb-4">
              分段设置（保留原参数）
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reedit-delimiter" className="text-[13px]">
                  分段标识符
                </Label>
                <Input
                  id="reedit-delimiter"
                  value={segmentConfig.delimiter}
                  onChange={(e) =>
                    updateConfig('delimiter', e.target.value)
                  }
                  className="mt-1 text-[13px]"
                />
              </div>
              <div>
                <Label htmlFor="reedit-maxLength" className="text-[13px]">
                  最大长度
                </Label>
                <Input
                  id="reedit-maxLength"
                  type="number"
                  value={segmentConfig.maxLength}
                  onChange={(e) =>
                    updateConfig('maxLength', parseInt(e.target.value, 10))
                  }
                  className="mt-1 text-[13px]"
                />
              </div>
              <div>
                <Label htmlFor="reedit-overlapLength" className="text-[13px]">
                  重叠长度
                </Label>
                <Input
                  id="reedit-overlapLength"
                  type="number"
                  value={segmentConfig.overlapLength}
                  onChange={(e) =>
                    updateConfig(
                      'overlapLength',
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="mt-1 text-[13px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reedit-replaceWhitespace"
                  checked={segmentConfig.replaceWhitespace}
                  onCheckedChange={(checked) =>
                    updateConfig('replaceWhitespace', checked === true)
                  }
                />
                <Label
                  htmlFor="reedit-replaceWhitespace"
                  className="text-[13px] cursor-pointer"
                >
                  替换连续空格/换行/制表符
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reedit-removeUrls"
                  checked={segmentConfig.removeUrls}
                  onCheckedChange={(checked) =>
                    updateConfig('removeUrls', checked === true)
                  }
                />
                <Label
                  htmlFor="reedit-removeUrls"
                  className="text-[13px] cursor-pointer"
                >
                  删除 URL 和邮箱
                </Label>
              </div>
            </div>
          </div>

          {/* 预览块 */}
          {previewChunks.length > 0 && (
            <div className="bg-white rounded-lg border border-[#e8ecf1] p-5">
              <h3 className="text-[15px] font-semibold text-[#1a202c] mb-4">
                分块预览（前 5 个）
              </h3>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {previewChunks.map((chunk, index) => (
                  <div
                    key={chunk.id}
                    className="border border-[#e8ecf1] rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-medium text-[#3478f6]">
                        #{index + 1}
                      </span>
                      <span className="text-[11px] text-[#9ba4b3]">
                        {chunk.charCount} 字符
                      </span>
                    </div>
                    <p className="text-[13px] text-[#4a5568] line-clamp-3">
                      {chunk.content.slice(0, 200)}
                      {chunk.content.length > 200 && '...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handlePreviewChunks}>
              预览块
            </Button>
            <Button onClick={handleSubmit}>重新提交</Button>
          </div>
        </div>

        {/* 错误提示 */}
        {dialogError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[13px] text-red-600">{dialogError}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
