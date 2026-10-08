export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'archived';

export type TaskPriority = 'urgent' | 'moderate' | 'low';

export interface TaskChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface TaskFileLink {
  id: string;
  title: string;
  url: string;
  platform?: 'drive' | 'figma' | 'canva' | 'sheets' | 'docs' | 'general';
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string; // Detail brief
  status: TaskStatus;
  priority: TaskPriority;
  category?: string; // e.g. "Live Production", "Marketing", "Design", "QA", "Operasional"
  deadline?: string; // YYYY-MM-DD
  picIds?: string[]; // IDs of selected hosts/admins
  picNames?: string[]; // Display names of PICs
  checklist: TaskChecklistItem[];
  fileLinks: TaskFileLink[];
  createdAt: string;
  updatedAt: string;
  brandId?: string;
  brandName?: string;
}

export type TaskViewMode = 'card' | 'list' | 'calendar';

export interface TaskFilterState {
  search: string;
  status: string; // 'all' or specific TaskStatus
  priority: string; // 'all' or specific TaskPriority
  category: string; // 'all' or specific category
  pic: string; // 'all' or specific PIC name
  includeArchived: boolean;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  columnBg: string;
  headerBorder: string;
}> = {
  todo: {
    label: 'To-do',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-200',
    columnBg: 'bg-slate-50/70',
    headerBorder: 'border-slate-300',
  },
  in_progress: {
    label: 'On Progress',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
    columnBg: 'bg-blue-50/20',
    headerBorder: 'border-blue-300',
  },
  in_review: {
    label: 'In Review',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-200',
    columnBg: 'bg-amber-50/20',
    headerBorder: 'border-amber-300',
  },
  done: {
    label: 'Completed',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    columnBg: 'bg-emerald-50/20',
    headerBorder: 'border-emerald-300',
  },
  archived: {
    label: 'Arsip',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-500',
    borderColor: 'border-slate-200',
    columnBg: 'bg-slate-100/40',
    headerBorder: 'border-slate-300',
  },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}> = {
  urgent: {
    label: 'URGENT PRIORITY',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600',
    badgeBorder: 'border-rose-200/80',
  },
  moderate: {
    label: 'MODERATE PRIORITY',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    badgeBorder: 'border-amber-200/80',
  },
  low: {
    label: 'LOW PRIORITY',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600',
    badgeBorder: 'border-emerald-200/80',
  },
};
