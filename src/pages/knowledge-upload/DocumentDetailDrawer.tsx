import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { getKnowledgeBaseById } from '@/utils/knowledgeBaseStorage';
import CommentThread from '@/components/report/CommentThread';
import {
  DOCUMENT_STATUS_LABEL,
  type KnowledgeDocument,
} from '@/models/knowledgeBaseModel';

interface DocumentDetailDrawerProps {
  doc: KnowledgeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentDetailDrawer({
  doc,
  open,
  onOpenChange,
}: DocumentDetailDrawerProps) {
  if (!doc) return null;

  const kb = getKnowledgeBaseById(doc.targetKnowledgeBaseId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>文档详情</SheetTitle>
          <SheetDescription>查看文档基本信息、分段参数和版本记录</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-medium text-dark-text-primary">基本信息</h4>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-dark-text-secondary">文档名称</span>
                <p className="text-dark-text-primary font-medium mt-0.5">{doc.name}</p>
              </div>
              <div>
                <span className="text-dark-text-secondary">格式</span>
                <p className="text-dark-text-primary font-medium mt-0.5 uppercase">
                  {doc.fileType}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">文件大小</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {formatFileSize(doc.fileSize)}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">上传人</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {doc.uploader}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">上传时间</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {new Date(doc.uploadTime).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">目标知识库</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {kb?.name || doc.targetKnowledgeBaseId}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">当前状态</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {DOCUMENT_STATUS_LABEL[doc.status]}
                </p>
              </div>
            </div>
          </div>

          {/* 分段参数 */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-medium text-dark-text-primary">
              分段参数
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-dark-text-secondary">分段标识符</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {doc.segmentConfig.delimiter}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">最大长度</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {doc.segmentConfig.maxLength}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">重叠长度</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {doc.segmentConfig.overlapLength}
                </p>
              </div>
              <div>
                <span className="text-dark-text-secondary">预处理规则</span>
                <p className="text-dark-text-primary font-medium mt-0.5">
                  {[
                    doc.segmentConfig.replaceWhitespace && '替换空格',
                    doc.segmentConfig.removeUrls && '删除URL',
                  ]
                    .filter(Boolean)
                    .join('、') || '无'}
                </p>
              </div>
            </div>
          </div>

          {/* 版本记录 */}
          {doc.versionRecords && doc.versionRecords.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[14px] font-medium text-dark-text-primary">
                版本记录
              </h4>
              <div className="relative pl-4 border-l-2 border-dark-border space-y-4">
                {doc.versionRecords.map((record, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-dark-accent-primary border-2 border-dark-border" />
                    <div className="text-[13px]">
                      <p className="font-medium text-dark-text-primary">
                        {record.changeType === 'upload' ? '首次上传' : '替换文件'}
                        {record.similarityScore != null && (
                          <span className="ml-2 text-[11px] text-dark-text-tertiary">
                            相似度 {record.similarityScore}%
                          </span>
                        )}
                      </p>
                      <p className="text-dark-text-secondary mt-0.5">
                        文件：{record.fileName}（{record.fileSize >= 1024 * 1024
                          ? `${(record.fileSize / 1024 / 1024).toFixed(1)} MB`
                          : record.fileSize >= 1024
                          ? `${(record.fileSize / 1024).toFixed(1)} KB`
                          : `${record.fileSize} B`}）
                      </p>
                      <p className="text-dark-text-secondary mt-0.5">
                        操作人：{record.operator}
                      </p>
                      <p className="text-dark-text-tertiary text-[11px] mt-0.5">
                        {new Date(record.changeTime).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 border-t border-dark-border pt-4">
          <CommentThread targetId={doc.id} targetType="knowledge" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
