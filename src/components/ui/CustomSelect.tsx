import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  disabled = false,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {searchable && (
            <div className="sticky top-0 z-10 bg-white px-2 py-2">
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari..."
                className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="relative cursor-default select-none px-4 py-2 text-slate-500">
              Tidak ada pilihan
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  className={`relative cursor-pointer select-none py-2 pl-3 pr-9 transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span
                    className={`block truncate ${isSelected ? 'font-bold' : 'font-medium'}`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
