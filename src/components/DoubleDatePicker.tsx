import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DoubleDatePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

const formatDateYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DoubleDatePicker: React.FC<DoubleDatePickerProps> = ({
  startDate,
  endDate,
  onChange,
  onApply,
  onCancel
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<string>('');
  
  useEffect(() => {
    if (startDate) {
      setCurrentMonth(new Date(startDate));
    }
  }, []);

  const handlePrevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };
  
  const renderCalendar = (monthOffset: number, isLeft: boolean) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const dates = [];
    
    // Prev month
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month
    for (let i = 1; dates.length < 42; i++) {
      dates.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    const startObj = startDate ? new Date(startDate) : null;
    const endObj = endDate ? new Date(endDate) : null;
    const hoverObj = hoverDate ? new Date(hoverDate) : null;

    if (startObj) startObj.setHours(0,0,0,0);
    if (endObj) endObj.setHours(0,0,0,0);
    if (hoverObj) hoverObj.setHours(0,0,0,0);

    return (
      <div className="flex-1 w-full sm:w-[220px]">
        <div className="flex justify-between items-center mb-3">
          {isLeft && (
            <div className="flex text-slate-400">
              <button onClick={handlePrevYear} className="p-1 hover:bg-slate-100 rounded"><ChevronsLeft className="w-4 h-4"/></button>
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
            </div>
          )}
          
          <div className="flex-1 text-center font-bold text-slate-800 text-xs">
            {year} - {String(month + 1).padStart(2, '0')}
          </div>

          {!isLeft && (
             <div className="flex text-slate-400">
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4"/></button>
              <button onClick={handleNextYear} className="p-1 hover:bg-slate-100 rounded"><ChevronsRight className="w-4 h-4"/></button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center mb-1">
          {days.map(day => (
            <div key={day} className="text-[10px] font-bold text-slate-400">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-0.5 gap-x-0 relative">
          {dates.map((item, i) => {
            const dateStr = formatDateYYYYMMDD(item.date);
            item.date.setHours(0,0,0,0);
            
            const isSelectedStart = startDate === dateStr;
            const isSelectedEnd = endDate === dateStr;
            
            let isInRange = false;
            let isHoverRange = false;

            if (startObj && endObj) {
              isInRange = item.date > startObj && item.date < endObj;
            } else if (startObj && !endObj && hoverObj) {
              if (item.date > startObj && item.date < hoverObj) {
                isHoverRange = true;
              } else if (item.date < startObj && item.date > hoverObj) {
                isHoverRange = true;
              }
            }
            
            const isBoundary = isSelectedStart || isSelectedEnd;
            let bgColor = "";
            let textColor = item.isCurrentMonth ? "text-slate-700" : "text-slate-300";
            
            if (isSelectedStart || isSelectedEnd) {
              bgColor = "bg-[#0d9488] z-10 relative";
              textColor = "text-white font-bold";
            } else if (isInRange || isHoverRange) {
              bgColor = "bg-[#eef5f4]";
              textColor = "text-slate-800 font-bold";
            } else if (!item.isCurrentMonth) {
              textColor = "text-slate-300";
            } else {
               textColor = "text-slate-600 font-bold";
            }

            let roundedClass = "rounded-none";
            if (isSelectedStart && isSelectedEnd) {
              roundedClass = "rounded-md";
            } else if ((isSelectedStart && endObj && startObj < endObj) || (isSelectedStart && !endObj && hoverObj && startObj < hoverObj)) {
              roundedClass = "rounded-l-md";
            } else if ((isSelectedStart && endObj && startObj > endObj) || (isSelectedStart && !endObj && hoverObj && startObj > hoverObj)) {
              roundedClass = "rounded-r-md";
            } else if ((isSelectedEnd && startObj && startObj < endObj) || (dateStr === hoverDate && startObj && startObj < hoverObj)) {
              roundedClass = "rounded-r-md";
            } else if ((isSelectedEnd && startObj && startObj > endObj) || (dateStr === hoverDate && startObj && startObj > hoverObj)) {
              roundedClass = "rounded-l-md";
            } else if (isSelectedStart) {
              roundedClass = "rounded-md";
            }

            if (dateStr === hoverDate && !isBoundary && startObj && !endObj) {
               bgColor = "bg-[#0d9488] z-10 relative opacity-80";
               textColor = "text-white font-bold";
            }

            return (
              <div 
                key={i} 
                className={`flex items-center justify-center h-7 w-full relative group cursor-pointer ${roundedClass} ${bgColor}`}
                onMouseEnter={() => setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate('')}
                onClick={() => {
                  if (!startDate || (startDate && endDate)) {
                    onChange(dateStr, ""); 
                  } else if (startDate && !endDate) {
                    const s = new Date(startDate);
                    if (item.date < s) {
                      onChange(dateStr, startDate);
                    } else {
                      onChange(startDate, dateStr);
                    }
                  }
                }}
              >
                <span className={`z-10 ${textColor} text-[10px] ${isBoundary ? "" : (isInRange || isHoverRange) ? "" : "group-hover:bg-slate-100 group-hover:text-slate-900"} h-6 w-6 rounded-full flex items-center justify-center transition-colors`}>
                  {item.date.getDate()}
                </span>
                {(isSelectedStart || isSelectedEnd) && (
                   <div className="absolute -bottom-1 w-[3px] h-[3px] rounded-full bg-teal-600"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-xl border border-slate-200 select-none">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
         {renderCalendar(0, true)}
         <div className="hidden sm:block w-[1px] bg-slate-100 my-6 mx-1" />
         {renderCalendar(1, false)}
      </div>
      <div className="flex items-center justify-end mt-3 pt-3 border-t border-slate-100 gap-2">
         <button onClick={onCancel} className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md">Batal</button>
         <button onClick={onApply} disabled={!startDate || !endDate} className="px-4 py-1.5 text-[10px] font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm">Terapkan</button>
      </div>
    </div>
  );
};
