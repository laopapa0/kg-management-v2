import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { KnowledgeBase } from '@/models/knowledgeBaseModel';

interface KnowledgeBaseDetailDrawerProps {
  base: KnowledgeBase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KnowledgeBaseDetailDrawer({
  base,
  open,
  onOpenChange,
}: KnowledgeBaseDetailDrawerProps) {
  if (!base) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>知识库详情</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h4 className="text-[14px] font-medium text-[#1a202c]">基本信息</h4>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-[#6b7789]">名称</span>
                <p className="text-[#1a202c] font-medium mt-0.5">{base.name}</p>
              </div>
              <div>
                <span className="text-[#6b7789]">类型</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {base.type === 'default' ? '默认业务知识库' : '专业知识库'}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">文档数量</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {base.documentCount}
                </p>
              </div>
              <div>
                <span className="text-[#6b7789]">创建时间</span>
                <p className="text-[#1a202c] font-medium mt-0.5">
                  {new Date(base.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </div>

          {/* 描述 */}
          {base.description && (
            <div>
              <h4 className="text-[14px] font-medium text-[#1a202c] mb-2">
                描述
              </h4>
              <p className="text-[13px] text-[#6b7789]">{base.description}</p>
            </div>
          )}

          {/* 统计占位 */}
          <div>
            <h4 className="text-[14px] font-medium text-[#1a202c] mb-3">
              统计概览
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f8f9fb] rounded-lg p-3 text-center">
                <div className="text-[20px] font-semibold text-[#1a202c]">
                  {base.documentCount}
                </div>
                <div className="text-[11px] text-[#6b7789] mt-1">文档总数</div>
              </div>
              <div className="bg-[#f8f9fb] rounded-lg p-3 text-center">
                <div className="text-[20px] font-semibold text-[#1a202c]">0</div>
                <div className="text-[11px] text-[#6b7789] mt-1">本月新增</div>
              </div>
              <div className="bg-[#f8f9fb] rounded-lg p-3 text-center">
                <div className="text-[20px] font-semibold text-[#1a202c]">—</div>
                <div className="text-[11px] text-[#6b7789] mt-1">格式占比</div>
              </div>
            </div>
          </div>

          {/* 文档列表占位 */}
          <div>
            <h4 className="text-[14px] font-medium text-[#1a202c] mb-3">
              已嵌入文档
            </h4>
            <div className="text-[13px] text-[#6b7789] py-8 text-center bg-[#f8f9fb] rounded-lg">
              暂无已嵌入文档
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
