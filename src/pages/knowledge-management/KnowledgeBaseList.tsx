import { Button } from '@/components/ui/button';
import { Trash2, Eye, Database } from 'lucide-react';
import type { KnowledgeBase } from '@/models/knowledgeBaseModel';

interface KnowledgeBaseListProps {
  bases: KnowledgeBase[];
  onDelete: (id: string) => void;
  onViewDetail: (base: KnowledgeBase) => void;
}

export default function KnowledgeBaseList({
  bases,
  onDelete,
  onViewDetail,
}: KnowledgeBaseListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bases.map((base) => (
        <div
          key={base.id}
          data-testid="kb-card"
          className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-[var(--accent-noc)]" />
              <h3 className="text-[15px] font-semibold text-dark-text-primary">
                {base.name}
              </h3>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                base.type === 'default'
                  ? 'bg-dark-accent-primary/10 text-dark-accent-primary'
                  : 'bg-[var(--accent-noc)]/10 text-[var(--accent-noc)]'
              }`}
            >
              {base.type === 'default' ? '默认' : '专业'}
            </span>
          </div>

          <p className="text-[13px] text-dark-text-secondary mb-4 line-clamp-2 min-h-[36px]">
            {base.description || '暂无描述'}
          </p>

          <div className="flex items-center justify-between text-[12px] text-dark-text-tertiary mb-4">
            <span>文档数: {base.documentCount}</span>
            <span>{new Date(base.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetail(base)}
            >
              <Eye size={14} className="mr-1" />
              查看详情
            </Button>
            {base.type !== 'default' && (
              <Button
                variant="outline"
                size="sm"
                data-testid="delete-btn"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(base.id)}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
