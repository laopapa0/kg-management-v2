import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { getKnowledgeBaseById } from '@/utils/knowledgeBaseStorage';
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
          <SheetDescription>查看文档基本信息、分段参数和审核历史</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-medium text-[#1a202c]">基本信息</h4>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-[#6b7789]">文档名称</span>
                <p className="text-[#1a202c] font-medium mt-0.5">{doc.name}</p>
              </div>
              <div>
                <span className="text-[#6b7789]">格式</span>
                <p className="text-[#1a202c] font-medium mt-0.5 uppercase">
                  {doc.fileType}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">文件大小</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {formatFileSize(doc.fileSize)}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">上传人</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {doc.uploader}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">上传时间</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {new Date(doc.uploadTime).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">目标知识库</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {kb?.name || doc.targetKnowledgeBaseId}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">当前状态</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {DOCUMENT_STATUS_LABEL[doc.status]}
                </p>
              </div>
            </div>
          </div>

          {/* 分段参数 */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-medium text-[#1a202c]">
              分段参数
            </h4>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-[#6b7789]">分段标识符</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {doc.segmentConfig.delimiter}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">最大长度</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {doc.segmentConfig.maxLength}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">重叠长度</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {doc.segmentConfig.overlapLength}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">预处理规则</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
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

          {/* 审核历史 */}
          {doc.auditRecords && doc.auditRecords.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[14px] font-medium text-[#1a202c]">
                审核历史
              </h4>
              <div className="relative pl-4 border-l-2 border-[#e8ecf1] space-y-4">
                {doc.auditRecords.map((record, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#3478f6] border-2 border-white" />
                    <div className="text-[13px]">
                      <p className="font-medium text-[#1a202c]">
                        {DOCUMENT_STATUS_LABEL[record.status]}
                      </p>
                      <p className="text-[#6b7789] mt-0.5">
                        审核人：{record.auditor}
                      </p>
                      <p className="text-[#9ba4b3] text-[11px] mt-0.5">
                        {new Date(record.auditTime).toLocaleString('zh-CN')}
                      </p>
                      {record.reason && (
                        <p className="text-[#6b7789] mt-1 bg-[#f8f9fb] rounded p-2">
                          原因：{record.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
