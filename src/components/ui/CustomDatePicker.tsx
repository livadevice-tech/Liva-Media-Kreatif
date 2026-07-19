import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pilih Tanggal',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleNextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));

  const formatDateYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const renderCalendar = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const dates = [];
    
    // Prev month
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month
    for (let i = 1; dates.length < 42; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return (
      <div className="w-[240px] p-2 bg-white rounded-xl shadow-xl border border-slate-200 select-none">
        <div className="flex justify-between items-center mb-3">
          <div className="flex text-slate-400">
            <button type="button" onClick={handlePrevYear} className="p-1 hover:bg-slate-100 rounded"><ChevronsLeft className="w-4 h-4"/></button>
            <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
          </div>
          <div className="flex-1 text-center font-bold text-slate-800 text-xs">
            {currentMonth.toLocaleString('default', { month: 'short' })} {year}
          </div>
          <div className="flex text-slate-400">
            <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4"/></button>
            <button type="button" onClick={handleNextYear} className="p-1 hover:bg-slate-100 rounded"><ChevronsRight className="w-4 h-4"/></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center mb-1">
          {days.map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 gap-x-0 relative">
          {dates.map((item, i) => {
            const dateStr = formatDateYYYYMMDD(item.date);
            const isSelected = value === dateStr;
            let bgColor = "hover:bg-slate-100";
            let textColor = item.isCurrentMonth ? "text-slate-700" : "text-slate-300";
            
            if (isSelected) {
              bgColor = "bg-indigo-600 hover:bg-indigo-700";
              textColor = "text-white font-bold";
            }

            return (
              <div 
                key={i} 
                className="flex items-center justify-center h-8 w-full cursor-pointer"
                onClick={() => {
                  onChange(dateStr);
                  setIsOpen(false);
                }}
              >
                <span className={`${textColor} ${bgColor} text-xs h-7 w-7 rounded-full flex items-center justify-center transition-colors`}>
                  {item.date.getDate()}
                </span>
              </div>
            );
          })}
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
          {displayText}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1">
          {renderCalendar()}
        </div>
      )}
    </div>
  );
};
