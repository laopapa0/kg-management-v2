import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Upload, X, FileText, Eye } from 'lucide-react';
import { getKnowledgeBases, createKnowledgeDocument } from '@/utils/knowledgeBaseStorage';
import MyDocumentsList from './MyDocumentsList';
import { documentChunker } from '@/utils/documentChunker';
import {
  DEFAULT_SEGMENT_CONFIG,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  type SegmentConfig,
  type DocumentChunk,
} from '@/models/knowledgeBaseModel';

export default function KnowledgeUploadPage() {
  const bases = getKnowledgeBases();
  const professionalBases = bases.filter((b) => b.type === 'professional');

  const [selectedExtraKb, setSelectedExtraKb] = useState('');
  const [segmentConfig, setSegmentConfig] = useState<SegmentConfig>(
    DEFAULT_SEGMENT_CONFIG,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [previewChunks, setPreviewChunks] = useState<DocumentChunk[]>([]);
  const [dialogError, setDialogError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedExtraKb('');
    setSegmentConfig(DEFAULT_SEGMENT_CONFIG);
    setSelectedFile(null);
    setFileError('');
    setPreviewChunks([]);
  }, []);

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

  const handleReset = useCallback(() => {
    setSegmentConfig(DEFAULT_SEGMENT_CONFIG);
    setPreviewChunks([]);
  }, []);

  const updateConfig = useCallback(
    (key: keyof SegmentConfig, value: string | number | boolean) => {
      setSegmentConfig((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const readFileText = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(String(e.target?.result || ''));
      };
      reader.readAsText(file);
    });
  };

  const validateChunks = (chunks: DocumentChunk[]): string | null => {
    if (chunks.length > 100) {
      return '分块过细，建议增大分段最大长度';
    }
    const hasOversized = chunks.some(
      (c) => c.content.length > segmentConfig.maxLength * 2,
    );
    if (hasOversized) {
      return '存在超长段落，建议调整分段标识符';
    }
    return null;
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
    if (!selectedFile) {
      setDialogError('请先上传文件');
      return;
    }

    const text = await readFileText(selectedFile);
    const chunks = documentChunker(text, segmentConfig);

    const error = validateChunks(chunks);
    if (error) {
      setDialogError(error);
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    createKnowledgeDocument({
      name: selectedFile.name,
      fileType: ext,
      fileSize: selectedFile.size,
      targetKnowledgeBaseId: selectedExtraKb || 'default',
      uploader: '业务部门用户',
      status: 'pending',
      segmentConfig,
      chunks,
    });

    setSubmitSuccess(true);
    resetForm();
  }, [selectedFile, segmentConfig, selectedExtraKb, resetForm]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-dark-text-primary">知识上传</h1>
        <p className="text-[13px] text-dark-text-secondary mt-1">
          上传业务文档到知识库，配置分段参数后保存
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">上传新文档</TabsTrigger>
          <TabsTrigger value="my">我的文档</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：表单内容 */}
            <div className="lg:col-span-7 space-y-6">
              {/* 知识库选择 */}
              <div className="bg-dark-elevated rounded-lg border border-dark-border p-5">
                <h3 className="text-[15px] font-semibold text-dark-text-primary mb-4">
                  目标知识库
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default-kb"
                      data-testid="default-kb-checkbox"
                      checked={true}
                      disabled={true}
                    />
                    <Label htmlFor="default-kb" className="text-[13px]">
                      默认业务知识库（必选）
                    </Label>
                  </div>
                  {professionalBases.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Label className="text-[13px] shrink-0">额外知识库:</Label>
                      <select
                        aria-label="额外知识库"
                        className="text-[13px] border border-dark-border rounded-md px-3 py-1.5 bg-dark-elevated"
                        value={selectedExtraKb}
                        onChange={(e) => setSelectedExtraKb(e.target.value)}
                      >
                        <option value="">不选择</option>
                        {professionalBases.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* 文件上传 */}
              <div className="bg-dark-elevated rounded-lg border border-dark-border p-5">
                <h3 className="text-[15px] font-semibold text-dark-text-primary mb-4">
                  文件上传
                </h3>

                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-dark-accent-primary hover:bg-dark-page transition-colors">
                    <Upload size={24} className="text-dark-text-tertiary mb-2" />
                    <span className="text-[13px] text-dark-text-secondary">
                      点击或拖拽上传文件
                    </span>
                    <span className="text-[11px] text-dark-text-tertiary mt-1">
                      支持 PDF/DOCX/MD/TXT/XML/CSV/PPTX/XLSX/HTM，≤15MB
                    </span>
                    <input
                      data-testid="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-dark-page rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-dark-accent-primary" />
                      <div>
                        <p className="text-[13px] font-medium text-dark-text-primary">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-dark-text-tertiary">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}

                {fileError && (
                  <p className="text-[12px] text-red-500 mt-2">{fileError}</p>
                )}
              </div>

              {/* 分段设置 */}
              <div className="bg-dark-elevated rounded-lg border border-dark-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-dark-text-primary">
                    分段设置
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    重置
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="delimiter" className="text-[13px]">
                      分段标识符
                    </Label>
                    <Input
                      id="delimiter"
                      value={segmentConfig.delimiter}
                      onChange={(e) =>
                        updateConfig('delimiter', e.target.value)
                      }
                      className="mt-1 text-[13px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLength" className="text-[13px]">
                      最大长度
                    </Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={segmentConfig.maxLength}
                      onChange={(e) =>
                        updateConfig('maxLength', parseInt(e.target.value, 10))
                      }
                      className="mt-1 text-[13px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overlapLength" className="text-[13px]">
                      重叠长度
                    </Label>
                    <Input
                      id="overlapLength"
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
                      id="replaceWhitespace"
                      checked={segmentConfig.replaceWhitespace}
                      onCheckedChange={(checked) =>
                        updateConfig('replaceWhitespace', checked === true)
                      }
                    />
                    <Label
                      htmlFor="replaceWhitespace"
                      className="text-[13px] cursor-pointer"
                    >
                      替换连续空格/换行/制表符
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeUrls"
                      checked={segmentConfig.removeUrls}
                      onCheckedChange={(checked) =>
                        updateConfig('removeUrls', checked === true)
                      }
                    />
                    <Label
                      htmlFor="removeUrls"
                      className="text-[13px] cursor-pointer"
                    >
                      删除 URL 和邮箱
                    </Label>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handlePreviewChunks}>
                  预览块
                </Button>
                <Button onClick={handleSubmit}>保存到知识库</Button>
              </div>
            </div>

            {/* 右侧：预览面板 */}
            <div className="lg:col-span-5">
              <div className="bg-dark-elevated rounded-lg border border-dark-border p-5 lg:sticky lg:top-4">
                <h3 className="text-[15px] font-semibold text-dark-text-primary mb-4">
                  分块预览
                </h3>

                {previewChunks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Eye size={40} className="text-dark-text-tertiary mb-3" />
                    <p className="text-[13px] text-dark-text-tertiary">
                      上传文件后点击「预览块」
                    </p>
                    <p className="text-[12px] text-dark-text-tertiary mt-1">
                      查看文档分段预览结果
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    <p className="text-[12px] text-dark-text-tertiary mb-2">
                      前 5 个分块
                    </p>
                    {previewChunks.map((chunk, index) => (
                      <div
                        key={chunk.id}
                        className="border border-dark-border rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[12px] font-medium text-dark-accent-primary">
                            #{index + 1}
                          </span>
                          <span className="text-[11px] text-dark-text-tertiary">
                            {chunk.charCount} 字符
                          </span>
                        </div>
                        <p className="text-[13px] text-dark-text-secondary line-clamp-3">
                          {chunk.content.slice(0, 200)}
                          {chunk.content.length > 200 && '...'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my">
          <MyDocumentsList />
        </TabsContent>
      </Tabs>

      {/* 错误弹窗 */}
      <Dialog open={!!dialogError} onOpenChange={() => setDialogError('')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提示</DialogTitle>
            <DialogDescription>{dialogError}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setDialogError('')}>知道了</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 成功弹窗 */}
      <Dialog open={submitSuccess} onOpenChange={() => setSubmitSuccess(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存成功</DialogTitle>
            <DialogDescription>
              文档已保存到知识库
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSubmitSuccess(false)}>知道了</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
