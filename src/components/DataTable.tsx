import { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── 类型 ─── */
export interface Column<T> {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (record: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((record: T, index: number) => string);
  loading?: boolean;
  emptyText?: string;
  selectedRow?: string | null;
  onRowClick?: (record: T) => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
  onSort?: (key: string) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
}

/* ─── 骨架屏行 ─── */
function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="h-12 px-4 border-b border-dark-border">
          <div className="h-4 bg-dark-card-l3 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

/* ─── DataTable 组件 ─── */
export default function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText = '暂无数据',
  selectedRow,
  onRowClick,
  sortConfig,
  onSort,
  pagination,
}: DataTableProps<T>) {
  const [selected] = useState<string | null>(selectedRow ?? null);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(record, index);
    if (rowKey) return String(record[rowKey]);
    return `row-${index}`;
  };

  const handleRowClick = (record: T) => {
    onRowClick?.(record);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    if (sortConfig?.key !== column.key) {
      return <ChevronsUpDown size={14} className="text-dark-text-tertiary ml-1" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp size={14} className="text-dark-accent-primary ml-1" />
      : <ChevronDown size={14} className="text-dark-accent-primary ml-1" />;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* 表头 */}
          <thead>
            <tr className="bg-dark-card-l2 border-b-2 border-dark-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'h-10 px-4 text-left text-[13px] font-medium text-dark-text-secondary whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer select-none hover:text-dark-text-primary',
                    col.width
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className={cn(
                    'flex items-center',
                    col.align === 'center' && 'justify-center',
                    col.align === 'right' && 'justify-end',
                  )}>
                    {col.title}
                    {getSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* 表体 */}
          <tbody>
            {loading ? (
              <>
                <SkeletonRow colCount={columns.length} />
                <SkeletonRow colCount={columns.length} />
                <SkeletonRow colCount={columns.length} />
                <SkeletonRow colCount={columns.length} />
                <SkeletonRow colCount={columns.length} />
              </>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-dark-text-tertiary">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-dark-text-tertiary">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                    <span className="text-[14px] text-dark-text-secondary">{emptyText}</span>
                    <span className="text-[12px] text-dark-text-tertiary">请添加数据或调整筛选条件</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selected === key;
                return (
                  <tr
                    key={key}
                    onClick={() => handleRowClick(record)}
                    className={cn(
                      'h-12 border-b border-dark-border transition-colors duration-100 cursor-pointer',
                      isSelected
                        ? 'bg-dark-accent-primary/10 [&::before]:content-[""] [&::before]:absolute [&::before]:left-0 [&::before]:top-0 [&::before]:bottom-0 [&::before]:w-[3px] [&::before]:bg-dark-accent-primary relative'
                        : 'hover:bg-dark-page'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 text-[14px] text-dark-text-secondary',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                        )}
                      >
                        {col.render
                          ? col.render(record, index)
                          : String((record as Record<string, unknown>)[col.key] ?? '')
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-end gap-3 mt-4 px-2">
          <span className="text-[13px] text-dark-text-secondary">
            共 {pagination.total} 条
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }).map((_, i) => (
              <button
                key={i}
                onClick={() => pagination.onChange(i + 1)}
                className={cn(
                  'w-8 h-8 rounded-md text-[13px] font-medium transition-colors',
                  pagination.current === i + 1
                    ? 'bg-dark-accent-primary text-white'
                    : 'text-dark-text-secondary hover:bg-dark-card-l2'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
