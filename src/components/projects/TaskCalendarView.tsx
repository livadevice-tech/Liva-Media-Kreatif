import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Tag, 
  AlertTriangle,
  FolderKanban,
  Lock
} from 'lucide-react';
import { Task, Project, TaskStatus, TaskPriority } from '../../types/app';

interface TaskCalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task, e: React.MouseEvent) => void;
  onOpenNewTask: (status?: TaskStatus, defaultDueDate?: string) => void;
  onUpdateTaskStatus?: (id: string, status: TaskStatus) => Promise<void>;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

const STATUS_COLORS: Record<TaskStatus, { dot: string; label: string; badge: string }> = {
  todo: { dot: 'bg-slate-400', label: 'To Do', badge: 'bg-slate-100 text-slate-700' },
  in_progress: { dot: 'bg-blue-500', label: 'In Progress', badge: 'bg-blue-50 text-blue-700' },
  review: { dot: 'bg-purple-500', label: 'Review', badge: 'bg-purple-50 text-purple-700' },
  done: { dot: 'bg-emerald-500', label: 'Done', badge: 'bg-emerald-50 text-emerald-700' },
};

const PRIORITY_BORDER: Record<TaskPriority, string> = {
  low: 'border-l-slate-400',
  medium: 'border-l-blue-500',
  high: 'border-l-amber-500',
  urgent: 'border-l-rose-500',
};

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  projects,
  onEditTask,
  onOpenNewTask,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation Handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Days in current & prev month
  const firstDay = new Date(year, month, 1);
  let startDayIndex = firstDay.getDay() - 1; // 0 = Mon, 6 = Sun
  if (startDayIndex === -1) startDayIndex = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const totalCells = startDayIndex + daysInMonth > 35 ? 42 : 35;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Filter tasks by status if needed
  const filteredTasks = useMemo(() => {
    if (selectedStatusFilter === 'all') return tasks;
    return tasks.filter((t) => t.status === selectedStatusFilter);
  }, [tasks, selectedStatusFilter]);

  // Tasks grouped by due_date (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      if (t.due_date) {
        const dateKey = t.due_date.slice(0, 10);
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  // Unscheduled tasks
  const unscheduledTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.due_date);
  }, [filteredTasks]);

  // Month stats
  const monthStats = useMemo(() => {
    const curMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const thisMonthTasks = tasks.filter((t) => t.due_date && t.due_date.startsWith(curMonthPrefix));
    return {
      total: thisMonthTasks.length,
      done: thisMonthTasks.filter((t) => t.status === 'done').length,
      inProgress: thisMonthTasks.filter((t) => t.status === 'in_progress').length,
      overdue: thisMonthTasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date < todayStr).length,
    };
  }, [tasks, year, month, todayStr]);

  // Calendar cells
  const cells = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalCells; i++) {
      let dayNum: number;
      let isCurMonth = false;
      let dateStr = '';

      if (i < startDayIndex) {
        dayNum = daysInPrevMonth - startDayIndex + i + 1;
        const prevM = month === 0 ? 12 : month;
        const prevY = month === 0 ? year - 1 : year;
        dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      } else if (i < startDayIndex + daysInMonth) {
        dayNum = i - startDayIndex + 1;
        isCurMonth = true;
        dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      } else {
        dayNum = i - startDayIndex - daysInMonth + 1;
        const nextM = month === 11 ? 1 : month + 2;
        const nextY = month === 11 ? year + 1 : year;
        dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      }

      const isToday = dateStr === todayStr;
      const dayTasks = tasksByDate[dateStr] || [];

      list.push({
        index: i,
        dayNum,
        isCurMonth,
        dateStr,
        isToday,
        tasks: dayTasks,
      });
    }
    return list;
  }, [totalCells, startDayIndex, daysInPrevMonth, daysInMonth, month, year, todayStr, tasksByDate]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Calendar Header Navigation Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Month & Year Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {MONTH_NAMES[month]} {year}
            </h2>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-2.5 py-1 hover:bg-white rounded-lg font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              Hari Ini
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Month Metrics & Status Filter */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedStatusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({tasks.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('todo')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedStatusFilter === 'todo'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => setSelectedStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedStatusFilter === 'in_progress'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setSelectedStatusFilter('done')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedStatusFilter === 'done'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Done
            </button>
          </div>

          {/* Month Stats Badges */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {monthStats.done} selesai
            </span>
            {monthStats.overdue > 0 && (
              <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-100 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {monthStats.overdue} terlambat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Days of Week Bar */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-[11px] font-bold text-slate-500 py-2 shrink-0">
        {DAY_NAMES.map((name, idx) => (
          <div key={idx} className="tracking-wider">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Grid Body */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-5 auto-rows-fr bg-slate-200 gap-px overflow-y-auto">
        {cells.map((cell) => (
          <div
            key={cell.index}
            className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors relative group ${
              cell.isCurMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
            } ${cell.isToday ? 'bg-blue-50/30 ring-1 ring-inset ring-indigo-500/20' : ''}`}
          >
            {/* Cell Top: Date Number & Add Button */}
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  cell.isToday
                    ? 'bg-indigo-600 text-white shadow-2xs font-black'
                    : cell.isCurMonth
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {cell.dayNum}
              </span>

              {/* Add Task on this Date Button */}
              <button
                onClick={() => onOpenNewTask('todo', cell.dateStr)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all cursor-pointer"
                title={`Tambah task pada tanggal ${cell.dateStr}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cell Tasks List */}
            <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar pr-0.5">
              {cell.tasks.slice(0, 3).map((task) => {
                const isOverdue = task.status !== 'done' && cell.dateStr < todayStr;
                return (
                  <div
                    key={task.id}
                    onClick={(e) => onEditTask(task, e)}
                    className={`p-1.5 rounded-lg border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer border-l-[3px] ${
                      isOverdue
                        ? 'border-l-rose-500 bg-rose-50/40'
                        : PRIORITY_BORDER[task.priority] || 'border-l-blue-500'
                    }`}
                    title={`${task.title} (${task.status.replace('_', ' ')})`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            STATUS_COLORS[task.status]?.dot || 'bg-slate-400'
                          }`}
                        />
                        {task.visibility === 'private' && (
                          <Lock className="w-2.5 h-2.5 text-purple-600 shrink-0" title="Private (Master Admin)" />
                        )}
                        <span
                          className={`text-[10px] font-semibold truncate leading-tight ${
                            task.status === 'done'
                              ? 'line-through text-slate-400'
                              : task.visibility === 'private'
                              ? 'text-purple-900 font-bold'
                              : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Assignee Initial Dot */}
                      {task.assignee_name && (
                        <div
                          className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[8px] flex items-center justify-center shrink-0 border border-slate-200"
                          title={task.assignee_name}
                        >
                          {task.assignee_name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Project Title Tag */}
                    {task.project_title && (
                      <div className="text-[9px] text-slate-400 truncate mt-0.5 flex items-center gap-0.5">
                        <FolderKanban className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{task.project_title}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Overflow Indicator */}
              {cell.tasks.length > 3 && (
                <div
                  onClick={() => onOpenNewTask('todo', cell.dateStr)}
                  className="text-[9px] font-semibold text-indigo-600 hover:underline text-center pt-0.5 cursor-pointer"
                >
                  +{cell.tasks.length - 3} task lainnya
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unscheduled Tasks Drawer / Footer (if any) */}
      {unscheduledTasks.length > 0 && (
        <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-700">
              {unscheduledTasks.length} Task Belum Memiliki Tenggat (Due Date):
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-0.5">
            {unscheduledTasks.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={(e) => onEditTask(t, e)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shrink-0 shadow-2xs truncate max-w-[140px]"
                title={`Buka task: ${t.title}`}
              >
                {t.title}
              </button>
            ))}
            {unscheduledTasks.length > 4 && (
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                +{unscheduledTasks.length - 4} lainnya
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
