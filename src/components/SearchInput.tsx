import { useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  width?: string;
}

export default function SearchInput({
  placeholder = '搜索...',
  value,
  onChange,
  onSearch,
  className,
  width = 'w-60',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? '');

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch?.('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(currentValue);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', width, className)}>
      <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ba4b3] pointer-events-none" />
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full pl-9 pr-8 rounded-md border border-[#dde1e8] bg-[#f8f9fb] text-[14px] text-[#4a5568]',
          'placeholder:text-[#9ba4b3]',
          'focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]',
          'transition-all duration-150'
        )}
      />
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ba4b3] hover:text-[#6b7789] transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
