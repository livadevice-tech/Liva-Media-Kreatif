import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check } from 'lucide-react';
import { formatDateYYYYMMDD } from '../../shared/utils/date';
import { ReportDateFilterType } from '../../shared/utils/reportTable';

const MONTHS = [
  { val: "01", label: "Jan" },
  { val: "02", label: "Feb" },
  { val: "03", label: "Mar" },
  { val: "04", label: "Apr" },
  { val: "05", label: "Mei" },
  { val: "06", label: "Jun" },
  { val: "07", label: "Jul" },
  { val: "08", label: "Agu" },
  { val: "09", label: "Sep" },
  { val: "10", label: "Okt" },
  { val: "11", label: "Nov" },
  { val: "12", label: "Des" },
];

interface AdvancedDatePickerProps {
  initialType: ReportDateFilterType;
  initialStartDate: string;
  initialEndDate: string;
  initialMonth: string;
  onApply: (type: ReportDateFilterType, startDate: string, endDate: string, month: string) => void;
  onCancel: () => void;
}

export function AdvancedDatePicker({
  initialType,
  initialStartDate,
  initialEndDate,
  initialMonth,
  onApply,
  onCancel
}: AdvancedDatePickerProps) {
  const [type, setType] = useState<ReportDateFilterType>(initialType);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  // For calendar views (daily, weekly, custom)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialStartDate) return new Date(initialStartDate);
    return new Date();
  });
  const [hoverDate, setHoverDate] = useState<string>('');
  
  // For month view
  const [monthPickerYear, setMonthPickerYear] = useState(() => {
    if (initialMonth) return parseInt(initialMonth.split('-')[0], 10);
    return new Date().getFullYear();
  });

  const handlePrevYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleNextYear = () => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));

  const handleDateClick = (dateStr: string) => {
    const clickedDate = new Date(dateStr);
    clickedDate.setHours(0,0,0,0);

    if (type === 'daily') {
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (type === 'weekly') {
      const startD = new Date(clickedDate);
      startD.setDate(startD.getDate() - 6);
      setStartDate(formatDateYYYYMMDD(startD));
      setEndDate(dateStr);
    } else if (type === 'custom') {
      if (!startDate || (startDate && endDate)) {
        setStartDate(dateStr);
        setEndDate(""); 
      } else if (startDate && !endDate) {
        const s = new Date(startDate);
        if (clickedDate < s) {
          setStartDate(dateStr);
          setEndDate(startDate);
        } else {
          setEndDate(dateStr);
        }
      }
    }
  };

  const renderCalendar = (monthOffset: number, showHeaderControls: boolean) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const dates = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      dates.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    for (let i = 1; dates.length < 42; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    const startObj = startDate ? new Date(startDate) : null;
    const endObj = endDate ? new Date(endDate) : null;
    const hoverObj = hoverDate ? new Date(hoverDate) : null;
    if (startObj) startObj.setHours(0,0,0,0);
    if (endObj) endObj.setHours(0,0,0,0);
    if (hoverObj) hoverObj.setHours(0,0,0,0);

    return (
      <div className="flex-1 w-full sm:w-[260px]">
        <div className="flex justify-between items-center mb-4 px-2">
          {showHeaderControls ? (
            <div className="flex text-slate-500">
              <button onClick={handlePrevYear} className="p-1 hover:bg-slate-100 rounded-md transition-colors"><ChevronsLeft className="w-4 h-4"/></button>
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-md transition-colors ml-1"><ChevronLeft className="w-4 h-4"/></button>
            </div>
          ) : <div className="w-[52px]" />}
          
          <div className="flex-1 text-center font-bold text-slate-800 text-[13px]">
            {MONTHS[month].label} {year}
          </div>

          {showHeaderControls ? (
             <div className="flex text-slate-500">
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-md transition-colors mr-1"><ChevronRight className="w-4 h-4"/></button>
              <button onClick={handleNextYear} className="p-1 hover:bg-slate-100 rounded-md transition-colors"><ChevronsRight className="w-4 h-4"/></button>
            </div>
          ) : <div className="w-[52px]" />}
        </div>
        
        <div className="grid grid-cols-7 gap-y-2 gap-x-0 text-center mb-2">
          {days.map(day => (
            <div key={day} className="text-[11px] font-bold text-slate-400">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 gap-x-0 relative">
          {dates.map((item, i) => {
            const dateStr = formatDateYYYYMMDD(item.date);
            item.date.setHours(0,0,0,0);
            
            const isSelectedStart = startDate === dateStr;
            const isSelectedEnd = endDate === dateStr;
            
            let isInRange = false;
            let isHoverRange = false;

            if (type === 'custom') {
              if (startObj && endObj) {
                isInRange = item.date > startObj && item.date < endObj;
              } else if (startObj && !endObj && hoverObj) {
                if (item.date > startObj && item.date < hoverObj) isHoverRange = true;
                else if (item.date < startObj && item.date > hoverObj) isHoverRange = true;
              }
            } else if (type === 'weekly') {
              if (startObj && endObj) {
                isInRange = item.date >= startObj && item.date <= endObj;
              } else if (hoverObj) {
                const hoverStart = new Date(hoverObj);
                hoverStart.setDate(hoverStart.getDate() - 6);
                if (item.date >= hoverStart && item.date <= hoverObj) {
                  isHoverRange = true;
                }
              }
            }
            
            const isBoundary = isSelectedStart || isSelectedEnd || (type === 'weekly' && isHoverRange && (item.date.getTime() === hoverObj?.getTime() || item.date.getTime() === (hoverObj ? new Date(hoverObj.getTime() - 6*86400000).getTime() : 0)));
            
            let bgColor = "";
            let textColor = item.isCurrentMonth ? "text-slate-700" : "text-slate-300";
            
            if (isSelectedStart || isSelectedEnd) {
              bgColor = "bg-[#5200ff] z-10 relative";
              textColor = "text-white font-bold shadow-sm";
            } else if (isInRange || isHoverRange) {
              bgColor = "bg-[#f2efff]";
              textColor = "text-slate-800 font-semibold";
            } else if (!item.isCurrentMonth) {
              textColor = "text-slate-300";
            } else {
               textColor = "text-slate-700 font-medium";
            }

            let roundedClass = "rounded-none";
            if (type === 'daily') {
              roundedClass = "rounded-lg";
            } else if (isSelectedStart && isSelectedEnd) {
              roundedClass = "rounded-lg";
            } else if ((isSelectedStart && endObj && startObj < endObj) || (isSelectedStart && !endObj && hoverObj && startObj < hoverObj)) {
              roundedClass = "rounded-l-lg";
            } else if ((isSelectedStart && endObj && startObj > endObj) || (isSelectedStart && !endObj && hoverObj && startObj > hoverObj)) {
              roundedClass = "rounded-r-lg";
            } else if ((isSelectedEnd && startObj && startObj < endObj) || (dateStr === hoverDate && startObj && startObj < hoverObj)) {
              roundedClass = "rounded-r-lg";
            } else if ((isSelectedEnd && startObj && startObj > endObj) || (dateStr === hoverDate && startObj && startObj > hoverObj)) {
              roundedClass = "rounded-l-lg";
            } else if (isSelectedStart) {
              roundedClass = "rounded-lg";
            }

            if (type === 'weekly' && isHoverRange && !isSelectedStart && !isSelectedEnd) {
              if (item.date.getTime() === hoverObj?.getTime()) {
                roundedClass = "rounded-r-lg";
                bgColor = "bg-[#5200ff] z-10 relative opacity-70";
                textColor = "text-white font-bold";
              } else if (hoverObj && item.date.getTime() === new Date(hoverObj.getTime() - 6*86400000).getTime()) {
                roundedClass = "rounded-l-lg";
                bgColor = "bg-[#5200ff] z-10 relative opacity-70";
                textColor = "text-white font-bold";
              }
            }

            if (type === 'custom' && dateStr === hoverDate && !isBoundary && startObj && !endObj) {
               bgColor = "bg-[#5200ff] z-10 relative opacity-70";
               textColor = "text-white font-bold";
               roundedClass = startObj > hoverObj ? "rounded-l-lg" : "rounded-r-lg";
            }

            return (
              <div 
                key={i} 
                className={`flex items-center justify-center h-9 w-full relative group cursor-pointer ${roundedClass} ${bgColor}`}
                onMouseEnter={() => setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate('')}
                onClick={() => handleDateClick(dateStr)}
              >
                <span className={`z-10 ${textColor} text-[13px] ${isBoundary ? "" : (isInRange || isHoverRange) ? "" : "group-hover:bg-slate-100 group-hover:text-slate-900"} h-8 w-8 rounded-full flex items-center justify-center transition-colors`}>
                  {item.date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthSelector = () => {
    return (
      <div className="flex-1 w-full sm:w-[260px] flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            type="button"
            onClick={() => setMonthPickerYear((year) => year - 1)}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
          >
            <ChevronsLeft className="w-4 h-4"/>
          </button>
          <div className="text-[13px] font-bold text-slate-800">
            {monthPickerYear}
          </div>
          <button
            type="button"
            onClick={() => setMonthPickerYear((year) => year + 1)}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
          >
            <ChevronsRight className="w-4 h-4"/>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 flex-1">
          {MONTHS.map((month) => {
            const monthValue = `${monthPickerYear}-${month.val}`;
            const isSelected = selectedMonth === monthValue;
            const currentDate = new Date();
            const isFuture =
              monthPickerYear > currentDate.getFullYear() ||
              (monthPickerYear === currentDate.getFullYear() &&
                parseInt(month.val, 10) > currentDate.getMonth() + 1);

            return (
              <button
                key={month.val}
                type="button"
                onClick={() => {
                  if (!isFuture) {
                    setSelectedMonth(monthValue);
                  }
                }}
                disabled={isFuture}
                className={`relative flex flex-col items-center justify-center rounded-xl border-0 py-3 text-[13px] font-semibold transition-all ${
                  isFuture
                    ? "cursor-not-allowed bg-slate-50 text-slate-300"
                    : isSelected 
                      ? "bg-[#5200ff] text-white shadow-[0_4px_12px_rgba(82,0,255,0.3)] scale-105 z-10" 
                      : "cursor-pointer bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-100"
                }`}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const renderRightPanel = () => {
    switch (type) {
      case 'latest':
        return (
          <div className="flex-1 w-full sm:w-[260px] flex flex-col items-center justify-center text-center p-6 h-full min-h-[280px]">
            <div className="h-12 w-12 rounded-full bg-[#f2efff] flex items-center justify-center mb-4 text-[#5200ff]">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-[14px] font-bold text-slate-800 mb-2">Data Terbaru</h4>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Menampilkan data dari tanggal laporan terakhir yang berhasil di-upload.
            </p>
          </div>
        );
      case 'monthly':
        return (
          <div className="flex h-full min-h-[280px]">
             {renderMonthSelector()}
          </div>
        );
      case 'daily':
      case 'weekly':
        return (
          <div className="flex h-full min-h-[280px]">
             {renderCalendar(0, true)}
          </div>
        );
      case 'custom':
        return (
          <div className="flex flex-col sm:flex-row gap-6 relative min-h-[280px]">
            {renderCalendar(0, true)}
            <div className="hidden sm:block w-[1px] bg-slate-100 my-4" />
            {renderCalendar(1, true)}
          </div>
        );
      default:
        return null;
    }
  }

  const canApply = () => {
    if (type === 'monthly') return !!selectedMonth;
    if (type === 'custom') return !!(startDate && endDate);
    if (type === 'daily') return !!startDate;
    if (type === 'weekly') return !!(startDate && endDate);
    return true; // latest
  }

  const handleApply = () => {
    onApply(type, startDate, endDate, selectedMonth);
  }

  const filters: { id: ReportDateFilterType, label: string }[] = [
    { id: 'latest', label: 'Terbaru' },
    { id: 'daily', label: 'Per-Hari' },
    { id: 'weekly', label: 'Per-Minggu' },
    { id: 'monthly', label: 'Per-Bulan' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0f8] select-none flex flex-col sm:flex-row overflow-hidden w-full max-w-full sm:max-w-none">
      {/* Sidebar */}
      <div className="w-full sm:w-[180px] bg-slate-50/50 border-b sm:border-b-0 sm:border-r border-[#e7e0f8] p-3 flex flex-col gap-1">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setType(filter.id)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              type === filter.id
                ? "bg-[#5200ff] text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            {filter.label}
            {type === filter.id && <Check className="w-4 h-4" strokeWidth={3} />}
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex-1">
          {renderRightPanel()}
        </div>
        
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-slate-100 gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleApply} 
            disabled={!canApply()} 
            className="px-6 py-2 text-[13px] font-bold text-white bg-[#5200ff] hover:bg-[#4300cc] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_4px_12px_rgba(82,0,255,0.2)] transition-all"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
