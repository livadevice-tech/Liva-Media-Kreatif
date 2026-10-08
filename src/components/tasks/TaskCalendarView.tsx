import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckSquare,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  TaskItem,
  TaskStatus,
  TaskCustomSettings,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from './types';
import {
  getStatusMeta,
  getPriorityMeta,
} from './taskTheme';

interface TaskCalendarViewProps {
  tasks: TaskItem[];
  onEditTask: (task: TaskItem) => void;
  onAddTaskWithDate: (dateStr: string) => void;
  taskSettings?: TaskCustomSettings;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onEditTask,
  onAddTaskWithDate,
  taskSettings,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().substring(0, 10);

  // Build grid calendar cells (42 cells: 6 weeks)
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // 3. Next month leading days to complete grid (up to multiple of 7)
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden font-sans">
      {/* Calendar Header Controls */}
      <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base leading-tight">
              {INDONESIAN_MONTHS[month]} {year}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Jadwal deadline task & penugasan tim
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Bulan sebelumnya"
              className="p-2 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <button
              type="button"
              onClick={handleNextMonth}
              title="Bulan berikutnya"
              className="p-2 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/50 text-center text-[11px] font-black uppercase tracking-wider text-slate-500 py-2.5">
        {WEEKDAYS.map((wd, i) => (
          <div key={wd} className={i === 0 || i === 6 ? 'text-rose-500' : ''}>
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-b border-slate-200">
        {calendarCells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          // Filter tasks with deadline matching this day
          const dayTasks = tasks.filter(
            (t) => t.deadline === cell.dateStr && t.status !== 'archived'
          );

          return (
            <div
              key={idx}
              className={`min-h-[115px] sm:min-h-[135px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors group relative ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/40 text-slate-400'
                  : isToday
                  ? 'bg-indigo-50/20'
                  : 'bg-white hover:bg-slate-50/40'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-black inline-flex items-center justify-center rounded-lg ${
                    isToday
                      ? 'w-6 h-6 bg-indigo-600 text-white shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <button
                  type="button"
                  onClick={() => onAddTaskWithDate(cell.dateStr)}
                  title={`Tambah task pada ${cell.dateStr}`}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks in this day */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5 no-scrollbar">
                {dayTasks.map((t) => {
                  const statusMeta = getStatusMeta(t.status, taskSettings);
                  const priorityMeta = getPriorityMeta(t.priority, taskSettings);
                  const isDone = statusMeta.isCompleted || t.status === 'done';

                  return (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(t);
                      }}
                      title={`${t.title} (${statusMeta.label})`}
                      className={`px-1.5 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer truncate flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 line-through opacity-75'
                          : `${statusMeta.badgeBg} ${statusMeta.badgeText} ${statusMeta.borderColor}`
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityMeta.dotColor}`}
                      />
                      <span className="truncate flex-1">{t.title}</span>
                    </div>
                  );
                })}
              </div>

              {/* Day footer counter if many */}
              {dayTasks.length > 3 && (
                <div className="text-[9px] font-bold text-slate-400 mt-1">
                  +{dayTasks.length - 3} lainnya
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="p-3 bg-slate-50/60 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-500">Status Task:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>To-do</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>On Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>In Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic">
          Klik pada tanggal untuk membuat task baru dengan deadline tersebut
        </div>
      </div>
    </div>
  );
};
