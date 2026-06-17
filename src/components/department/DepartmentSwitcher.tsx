import { useState } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockDepartments } from '@/data/mockAttachmentData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Department {
  id: string;
  name: string;
}

export interface DepartmentSwitcherProps {
  departments?: Department[];
  defaultDepartmentId?: string;
  onChange?: (department: Department) => void;
}

export function DepartmentSwitcher({
  departments = mockDepartments,
  defaultDepartmentId = 'dept-财务部',
  onChange,
}: DepartmentSwitcherProps) {
  const [selectedId, setSelectedId] = useState(defaultDepartmentId);
  const selected = departments.find((d) => d.id === selectedId) ?? departments[0];

  const handleSelect = (department: Department) => {
    setSelectedId(department.id);
    onChange?.(department);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="department-switcher-trigger"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium',
          'bg-[var(--dark-card-l1)] text-[var(--dark-text-primary)]',
          'border border-[var(--dark-border-default)]',
          'hover:border-[var(--dark-border-hover)] hover:bg-[var(--dark-card-l2)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--dark-focus-ring)]',
          'transition-colors duration-150',
        )}
      >
        <Building2 size={14} className="text-[var(--dark-accent-primary)]" />
        <span>{selected?.name ?? '选择部门'}</span>
        <ChevronDown size={14} className="text-[var(--dark-text-tertiary)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'min-w-[10rem] p-1',
          'bg-[var(--dark-card-l1)] border-[var(--dark-border-default)]',
        )}
      >
        {departments.map((dept) => (
          <DropdownMenuItem
            key={dept.id}
            onClick={() => handleSelect(dept)}
            className={cn(
              'text-[13px] text-[var(--dark-text-primary)]',
              'hover:bg-[var(--dark-card-l2)] hover:text-[var(--dark-text-primary)]',
              'focus:bg-[var(--dark-card-l2)] focus:text-[var(--dark-text-primary)]',
              'cursor-pointer',
              selectedId === dept.id && 'bg-[var(--dark-card-l2)]',
            )}
          >
            {dept.name}
            {selectedId === dept.id && (
              <span className="ml-auto text-[var(--dark-accent-primary)] text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
