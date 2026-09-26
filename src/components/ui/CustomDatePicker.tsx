import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  X,
} from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md';
  align?: 'left' | 'right';
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pilih Tanggal',
  className = '',
  buttonClassName = '',
  disabled = false,
  size = 'md',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  const triggerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize currentMonth to value if exists, else today
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return new Date();
  });

  useEffect(() => {
    if (value && !isOpen) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setCurrentMonth(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
      }
    }
  }, [value, isOpen]);

  // Position calculation with portal
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const calendarHeight = 330;
    const calendarWidth = 280;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const isUp = spaceBelow < calendarHeight && spaceAbove > spaceBelow;

    let left = align === 'right' ? rect.right - calendarWidth : rect.left;
    if (left + calendarWidth > window.innerWidth - 12) {
      left = window.innerWidth - calendarWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    setOpenDirection(isUp ? 'up' : 'down');
    setCoords({
      top: isUp ? rect.top - 6 : rect.bottom + 6,
      left,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setViewMode('days');

      const handleScroll = (e: Event) => {
        if (calendarRef.current && calendarRef.current.contains(e.target as Node)) return;
        updatePosition();
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Handle click outside and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        calendarRef.current &&
        !calendarRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };

  const formatDateYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    onChange(formatDateYYYYMMDD(today));
    setCurrentMonth(today);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const renderDaysView = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = formatDateYYYYMMDD(new Date());
    const dates = [];

    // Prev month days
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month days to fill 42 cells grid (6 rows)
    for (let i = 1; dates.length < 42; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return (
      <>
        {/* Month / Year Navigation Header */}
        <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tahun Sebelumnya"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('months');
              }}
              className="px-1.5 py-0.5 rounded-md hover:bg-purple-50 text-slate-800 hover:text-purple-700 font-black text-xs tracking-tight transition-colors cursor-pointer"
            >
              {MONTHS_ID[month]}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('years');
              }}
              className="px-1.5 py-0.5 rounded-md hover:bg-purple-50 text-slate-800 hover:text-purple-700 font-black text-xs tracking-tight transition-colors cursor-pointer"
            >
              {year}
            </button>
          </div>

          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tahun Berikutnya"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {DAYS_ID.map((day, idx) => (
            <div
              key={day}
              className={`text-[10px] font-bold ${idx === 0 ? 'text-rose-500' : 'text-slate-400'}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 relative">
          {dates.map((item, i) => {
            const dateStr = formatDateYYYYMMDD(item.date);
            const isSelected = value === dateStr;
            const isToday = todayStr === dateStr;

            let cellClass = 'hover:bg-purple-50 hover:text-purple-700 text-slate-700';

            if (!item.isCurrentMonth) {
              cellClass = 'text-slate-300 hover:bg-slate-50 hover:text-slate-500';
            }

            if (isSelected) {
              cellClass =
                'bg-purple-600 text-white font-bold shadow-xs hover:bg-purple-700 hover:text-white';
            }

            return (
              <div
                key={i}
                className="flex items-center justify-center h-7 w-full cursor-pointer relative"
                onClick={() => {
                  onChange(dateStr);
                  setIsOpen(false);
                }}
              >
                <span
                  className={`${cellClass} text-xs h-7 w-7 rounded-xl flex items-center justify-center transition-all ${
                    isToday && !isSelected
                      ? 'ring-1.5 ring-purple-400 font-bold text-purple-700 bg-purple-50/50'
                      : ''
                  }`}
                >
                  {item.date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderMonthsView = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <span className="font-bold text-xs text-slate-700">Pilih Bulan ({currentMonth.getFullYear()})</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('days');
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS_ID.map((m, idx) => {
            const isCurrent = currentMonth.getMonth() === idx;
            return (
              <button
                key={m}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMonth(new Date(currentMonth.getFullYear(), idx, 1));
                  setViewMode('days');
                }}
                className={`py-2 px-1 text-xs rounded-xl font-bold transition-all ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearsView = () => {
    const currentYear = currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear - 4 + i);

    return (
      <div>
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <span className="font-bold text-xs text-slate-700">Pilih Tahun</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('days');
            }}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((y) => {
            const isCurrent = currentMonth.getFullYear() === y;
            return (
              <button
                key={y}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMonth(new Date(y, currentMonth.getMonth(), 1));
                  setViewMode('days');
                }}
                className={`py-2 px-1 text-xs rounded-xl font-bold transition-all ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    return (
      <div
        ref={calendarRef}
        className="w-[280px] p-3.5 bg-white rounded-2xl shadow-2xl border border-slate-200/90 select-none backdrop-blur-md ring-1 ring-black/5 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {viewMode === 'days' && renderDaysView()}
        {viewMode === 'months' && renderMonthsView()}
        {viewMode === 'years' && renderYearsView()}

        {/* Quick Footer Shortcuts */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] font-semibold">
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={handleSelectToday}
            className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-800 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer font-bold"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Hari Ini</span>
          </button>
        </div>
      </div>
    );
  };

  // Format display text
  let displayText = placeholder;
  if (value) {
    const parts = value.split('-');
    if (parts.length === 3) {
      displayText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }

  // Sizing styles
  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[11px] rounded-lg'
      : size === 'sm'
      ? 'px-2.5 py-1 text-[11px] rounded-lg'
      : 'px-3 py-2 text-xs sm:text-sm rounded-xl';

  const iconSizes = size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          `flex w-full items-center justify-between gap-2 border border-slate-200 bg-white ${sizeClasses} font-semibold text-slate-700 shadow-3xs transition-all hover:bg-slate-50 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`
        }
      >
        <span className="block truncate">{displayText}</span>
        <CalendarIcon className={`${iconSizes} text-slate-400 shrink-0`} />
      </button>

      {isOpen &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: openDirection === 'up' ? undefined : `${coords.top}px`,
              bottom: openDirection === 'up' ? `${window.innerHeight - coords.top}px` : undefined,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
          >
            {renderCalendar()}
          </div>,
          document.body
        )}
    </div>
  );
};
