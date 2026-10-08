import React, { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  Clock,
  Calendar,
  CheckSquare,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Archive,
  Trash2,
  Edit2,
  AlertTriangle,
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
  getCategoryMeta,
  DEFAULT_TASK_SETTINGS,
} from './taskTheme';

interface TaskKanbanViewProps {
  tasks: TaskItem[];
  onEditTask: (task: TaskItem) => void;
  onAddTaskToStatus: (status: TaskStatus) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  showArchivedColumn?: boolean;
  taskSettings?: TaskCustomSettings;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onEditTask,
  onAddTaskToStatus,
  onUpdateTaskStatus,
  onDeleteTask,
  showArchivedColumn = false,
  taskSettings,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  const statusesList = taskSettings?.statuses || DEFAULT_TASK_SETTINGS.statuses;
  const filteredStatuses = statusesList.filter((s) => showArchivedColumn || !s.isArchived);

  const columns = filteredStatuses.map((st) => {
    const meta = getStatusMeta(st.id, taskSettings);
    return {
      status: st.id as TaskStatus,
      label: st.label,
      headerColor: meta.headerText,
      dotColor: meta.dotColor,
      columnBg: meta.columnBg,
      headerBorder: meta.headerBorder,
    };
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1020px] items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex-1 min-w-[280px] max-w-[340px] rounded-2xl flex flex-col transition-all duration-200 ${
                isOver
                  ? 'bg-indigo-50/70 ring-2 ring-indigo-400 ring-dashed'
                  : 'bg-slate-100/70 border border-slate-200/60'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 bg-white/60 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className={`font-black text-xs ${col.headerColor}`}>
                    {col.label}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAddTaskToStatus(col.status)}
                    title={`Tambah task ke ${col.label}`}
                    className="w-6 h-6 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card List in Column */}
              <div className="p-2.5 space-y-2.5 min-h-[140px] flex-1">
                {colTasks.map((task) => {
                  const priorityMeta = getPriorityMeta(task.priority, taskSettings);
                  const totalChecklist = task.checklist?.length || 0;
                  const doneChecklist = task.checklist?.filter((c) => c.isDone).length || 0;
                  const progress = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;
                  const totalFiles = task.fileLinks?.length || 0;
                  const isMenuOpen = activeMenuTaskId === task.id;

                  // Deadline check
                  const isOverdue = task.deadline && task.deadline < todayStr && task.status !== 'done';
                  const isDueToday = task.deadline && task.deadline === todayStr;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onEditTask(task)}
                      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer p-3.5 relative group overflow-hidden ${
                        draggedTaskId === task.id ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Priority Tag & Category Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${priorityMeta.badgeBg} ${priorityMeta.badgeText} ${priorityMeta.badgeBorder}`}
                        >
                          {priorityMeta.label}
                        </span>

                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuTaskId(isMenuOpen ? null : task.id)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-6 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-fadeIn text-[11px] font-semibold text-slate-700">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  onEditTask(task);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-3 h-3 text-indigo-600" />
                                Edit Task
                              </button>
                              <div className="px-3 py-1 text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                                Pindahkan ke
                              </div>
                              {columns.map((target) => (
                                <button
                                  key={target.status}
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuTaskId(null);
                                    onUpdateTaskStatus(task.id, target.status);
                                  }}
                                  className={`w-full px-3 py-1 text-left hover:bg-slate-50 flex items-center gap-1.5 ${
                                    task.status === target.status ? 'text-indigo-600 font-bold bg-indigo-50/40' : ''
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full ${target.dotColor}`} />
                                  {target.label}
                                </button>
                              ))}
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuTaskId(null);
                                  onDeleteTask(task.id);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                Hapus Task
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Category Label */}
                      {task.category && (() => {
                        const catMeta = getCategoryMeta(task.category, taskSettings);
                        return (
                          <div className="mb-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block max-w-full truncate ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.borderColor}`}
                            >
                              {task.category}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Task Title */}
                      <h4 className="text-xs font-black text-slate-800 leading-snug mb-1.5 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Task Description Snippet */}
                      {task.description && (
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-2 mb-2.5 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Checklist Progress Bar */}
                      {totalChecklist > 0 && (
                        <div className="mb-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-indigo-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Deadline Alert Pill */}
                      {task.deadline && (
                        <div className="mb-2.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isDueToday
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-200/80'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {isOverdue ? 'Overdue: ' : isDueToday ? 'Hari Ini: ' : 'Deadline: '}
                            {task.deadline}
                          </span>
                        </div>
                      )}

                      {/* Card Footer: Metadata & Avatars */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center gap-2.5">
                          {totalChecklist > 0 && (
                            <span className="flex items-center gap-1 font-bold text-slate-600" title="Subtask checklist">
                              <CheckSquare className="w-3 h-3 text-slate-400" />
                              {doneChecklist}/{totalChecklist}
                            </span>
                          )}
                          {totalFiles > 0 && (
                            <span className="flex items-center gap-1 font-bold text-slate-600" title="File attachment links">
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              {totalFiles}
                            </span>
                          )}
                        </div>

                        {/* PIC Avatar Stack */}
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {task.picNames && task.picNames.length > 0 ? (
                            task.picNames.slice(0, 3).map((pic, idx) => (
                              <div
                                key={idx}
                                title={pic}
                                className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0"
                              >
                                {pic.charAt(0).toUpperCase()}
                              </div>
                            ))
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] font-bold ring-1 ring-slate-200">
                              -
                            </div>
                          )}
                          {task.picNames && task.picNames.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[8px] flex items-center justify-center ring-2 ring-white">
                              +{task.picNames.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    <p className="font-semibold mb-1">Belum ada task</p>
                    <p className="text-[10px] text-slate-400">Tarik kartu atau klik tambah</p>
                  </div>
                )}
              </div>

              {/* Column Bottom Quick Add Button */}
              <div className="p-2.5 pt-0">
                <button
                  type="button"
                  onClick={() => onAddTaskToStatus(col.status)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 font-bold text-xs border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
