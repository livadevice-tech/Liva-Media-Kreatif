import React from 'react';
import {
  Clock,
  Calendar,
  CheckSquare,
  Paperclip,
  ExternalLink,
  Edit2,
  Trash2,
  User,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  TaskItem,
  TaskStatus,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from './types';

interface TaskListViewProps {
  tasks: TaskItem[];
  onEditTask: (task: TaskItem) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onEditTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <CheckSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <h4 className="font-black text-slate-700 text-sm">Tidak ada task yang cocok</h4>
        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-36">Status</th>
              <th className="py-3 px-4">Nama Task & Kategori</th>
              <th className="py-3 px-4 w-36">Prioritas</th>
              <th className="py-3 px-4 w-44">PIC</th>
              <th className="py-3 px-4 w-36">Deadline</th>
              <th className="py-3 px-4 w-32">Progress</th>
              <th className="py-3 px-4 w-32">File Links</th>
              <th className="py-3 px-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const statusMeta = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.todo;
              const priorityMeta = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.moderate;
              const totalChecklist = task.checklist?.length || 0;
              const doneChecklist = task.checklist?.filter((c) => c.isDone).length || 0;
              const progress = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;
              const totalFiles = task.fileLinks?.length || 0;

              const isOverdue = task.deadline && task.deadline < todayStr && task.status !== 'done';
              const isDueToday = task.deadline && task.deadline === todayStr;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Status Dropdown Pill */}
                  <td className="py-3 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg border outline-none cursor-pointer text-center appearance-none transition-all shadow-2xs ${
                        task.status === 'done'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : task.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : task.status === 'in_review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : task.status === 'archived'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <option value="todo">To-do</option>
                      <option value="in_progress">On Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Completed</option>
                      <option value="archived">Arsip</option>
                    </select>
                  </td>

                  {/* Task Name & Category */}
                  <td className="py-3 px-4">
                    <div
                      onClick={() => onEditTask(task)}
                      className="cursor-pointer group/title"
                    >
                      <div className="font-bold text-slate-800 text-xs group-hover/title:text-indigo-600 transition-colors">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.category && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {task.category}
                          </span>
                        )}
                        {task.description && (
                          <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                            • {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${priorityMeta.badgeBg} ${priorityMeta.badgeText} ${priorityMeta.badgeBorder}`}
                    >
                      {priorityMeta.label}
                    </span>
                  </td>

                  {/* PIC */}
                  <td className="py-3 px-4">
                    {task.picNames && task.picNames.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.picNames.map((pic, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/80 text-indigo-700 text-[10px] font-bold border border-indigo-100 shadow-2xs"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black">
                              {pic.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate max-w-[100px]">{pic}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">-</span>
                    )}
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4">
                    {task.deadline ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isDueToday
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        {task.deadline}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Progress (Checklist) */}
                  <td className="py-3 px-4">
                    {totalChecklist > 0 ? (
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>{doneChecklist}/{totalChecklist}</span>
                          <span className="text-indigo-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Tidak ada subtask</span>
                    )}
                  </td>

                  {/* File Links */}
                  <td className="py-3 px-4">
                    {totalFiles > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        {task.fileLinks.slice(0, 2).map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.title}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded transition-colors"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[70px]">{link.title}</span>
                          </a>
                        ))}
                        {totalFiles > 2 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            +{totalFiles - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        title="Edit Task"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Hapus task ini?')) {
                            onDeleteTask(task.id);
                          }
                        }}
                        title="Hapus Task"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
