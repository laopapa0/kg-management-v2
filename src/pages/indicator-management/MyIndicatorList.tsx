import type { IndicatorApplication } from '@/utils/indicatorStorage';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import type { Column } from '@/components/DataTable';

interface MyIndicatorListProps {
  indicators: IndicatorApplication[];
  selectedId?: string;
  onSelect: (indicator: IndicatorApplication) => void;
  onChange: (indicator: IndicatorApplication) => void;
}

const statusMap: Record<IndicatorApplication['status'], { type: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'noc'; text: string }> = {
  editing: { type: 'default', text: '编辑中' },
  pending: { type: 'warning', text: '待审核' },
  approved: { type: 'success', text: '已通过' },
  rejected: { type: 'error', text: '被驳回' },
};

export default function MyIndicatorList({
  indicators,
  selectedId,
  onSelect,
  onChange,
}: MyIndicatorListProps) {
  const columns: Column<IndicatorApplication>[] = [
    {
      key: 'name',
      title: '指标名称',
      render: (record) => (
        <div>
          <div className="text-[14px] font-medium text-[#1a202c]">{record.name}</div>
          <div className="text-[12px] text-[#9ba4b3]">{record.code}</div>
        </div>
      ),
    },
    {
      key: 'source',
      title: '大屏来源',
    },
    {
      key: 'status',
      title: '状态',
      render: (record) => {
        const { type, text } = statusMap[record.status];
        return <StatusBadge text={text} type={type} />;
      },
    },
    {
      key: 'action',
      title: '操作',
      render: (record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onChange(record);
          }}
        >
          变更
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={indicators}
      rowKey="id"
      selectedRow={selectedId ?? null}
      onRowClick={onSelect}
      emptyText="暂无指标申请"
    />
  );
}
