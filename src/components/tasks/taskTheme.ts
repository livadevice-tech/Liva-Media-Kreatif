import {
  TaskCustomSettings,
  TaskThemeColor,
  ThemeColorStyle,
} from './types';

export const THEME_COLOR_MAP: Record<TaskThemeColor, ThemeColorStyle> = {
  slate: {
    id: 'slate',
    label: 'Abu-abu (Netral)',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-400',
    columnBg: 'bg-slate-50/70',
    headerBorder: 'border-slate-300',
    headerText: 'text-slate-800',
  },
  blue: {
    id: 'blue',
    label: 'Biru (Blue)',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    columnBg: 'bg-blue-50/25',
    headerBorder: 'border-blue-300',
    headerText: 'text-blue-900',
  },
  indigo: {
    id: 'indigo',
    label: 'Indigo (Ungu Biru)',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    columnBg: 'bg-indigo-50/20',
    headerBorder: 'border-indigo-300',
    headerText: 'text-indigo-900',
  },
  purple: {
    id: 'purple',
    label: 'Ungu (Purple)',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-500',
    columnBg: 'bg-purple-50/20',
    headerBorder: 'border-purple-300',
    headerText: 'text-purple-900',
  },
  pink: {
    id: 'pink',
    label: 'Pink (Merah Muda)',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    borderColor: 'border-pink-200',
    dotColor: 'bg-pink-500',
    columnBg: 'bg-pink-50/20',
    headerBorder: 'border-pink-300',
    headerText: 'text-pink-900',
  },
  rose: {
    id: 'rose',
    label: 'Merah (Rose / Urgent)',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
    columnBg: 'bg-rose-50/20',
    headerBorder: 'border-rose-300',
    headerText: 'text-rose-900',
  },
  amber: {
    id: 'amber',
    label: 'Kuning / Amber',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    columnBg: 'bg-amber-50/25',
    headerBorder: 'border-amber-300',
    headerText: 'text-amber-900',
  },
  orange: {
    id: 'orange',
    label: 'Oranye (Orange)',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
    columnBg: 'bg-orange-50/20',
    headerBorder: 'border-orange-300',
    headerText: 'text-orange-900',
  },
  emerald: {
    id: 'emerald',
    label: 'Hijau (Emerald / Done)',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    columnBg: 'bg-emerald-50/25',
    headerBorder: 'border-emerald-300',
    headerText: 'text-emerald-900',
  },
  teal: {
    id: 'teal',
    label: 'Teal (Hijau Toska)',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-500',
    columnBg: 'bg-teal-50/20',
    headerBorder: 'border-teal-300',
    headerText: 'text-teal-900',
  },
  cyan: {
    id: 'cyan',
    label: 'Cyan (Biru Langit)',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    dotColor: 'bg-cyan-500',
    columnBg: 'bg-cyan-50/20',
    headerBorder: 'border-cyan-300',
    headerText: 'text-cyan-900',
  },
};

export const COLOR_OPTIONS: { id: TaskThemeColor; label: string; previewClass: string }[] = [
  { id: 'slate', label: 'Abu-abu Netral', previewClass: 'bg-slate-400' },
  { id: 'blue', label: 'Biru (Primary)', previewClass: 'bg-blue-500' },
  { id: 'indigo', label: 'Indigo (Modern)', previewClass: 'bg-indigo-500' },
  { id: 'purple', label: 'Ungu (Kreatif)', previewClass: 'bg-purple-500' },
  { id: 'pink', label: 'Pink (Highlight)', previewClass: 'bg-pink-500' },
  { id: 'rose', label: 'Merah (Urgent)', previewClass: 'bg-rose-500' },
  { id: 'amber', label: 'Amber (Perhatian)', previewClass: 'bg-amber-500' },
  { id: 'orange', label: 'Oranye (Aktif)', previewClass: 'bg-orange-500' },
  { id: 'emerald', label: 'Hijau (Selesai)', previewClass: 'bg-emerald-500' },
  { id: 'teal', label: 'Teal (Toska)', previewClass: 'bg-teal-500' },
  { id: 'cyan', label: 'Cyan (Langit)', previewClass: 'bg-cyan-500' },
];

export const DEFAULT_TASK_SETTINGS: TaskCustomSettings = {
  statuses: [
    { id: 'todo', label: 'To-do', color: 'slate', isDefault: true },
    { id: 'in_progress', label: 'On Progress', color: 'blue' },
    { id: 'in_review', label: 'In Review', color: 'amber' },
    { id: 'done', label: 'Completed', color: 'emerald', isCompleted: true },
    { id: 'archived', label: 'Arsip (Archived)', color: 'slate', isArchived: true },
  ],
  priorities: [
    { id: 'urgent', label: 'Urgent Priority', color: 'rose' },
    { id: 'moderate', label: 'Moderate Priority', color: 'amber' },
    { id: 'low', label: 'Low Priority', color: 'emerald' },
  ],
  categories: [
    { id: 'cat-1', name: 'Live Production', color: 'indigo' },
    { id: 'cat-2', name: 'Desain & Kreatif', color: 'purple' },
    { id: 'cat-3', name: 'Marketing', color: 'pink' },
    { id: 'cat-4', name: 'Quality Assurance', color: 'amber' },
    { id: 'cat-5', name: 'Reporting & Admin', color: 'blue' },
    { id: 'cat-6', name: 'Operasional Studio', color: 'emerald' },
  ],
};

export function getStatusMeta(statusId: string, settings?: TaskCustomSettings) {
  const custom = settings?.statuses?.find((s) => s.id === statusId);
  if (custom) {
    const style = THEME_COLOR_MAP[custom.color] || THEME_COLOR_MAP.slate;
    return {
      id: custom.id,
      label: custom.label,
      badgeBg: style.badgeBg,
      badgeText: style.badgeText,
      borderColor: style.borderColor,
      columnBg: style.columnBg,
      headerBorder: style.headerBorder,
      headerText: style.headerText,
      dotColor: style.dotColor,
      isCompleted: !!custom.isCompleted,
      isArchived: !!custom.isArchived,
    };
  }

  // Fallback defaults
  if (statusId === 'done') {
    return {
      id: 'done',
      label: 'Completed',
      ...THEME_COLOR_MAP.emerald,
      isCompleted: true,
      isArchived: false,
    };
  }
  if (statusId === 'in_progress') {
    return {
      id: 'in_progress',
      label: 'On Progress',
      ...THEME_COLOR_MAP.blue,
      isCompleted: false,
      isArchived: false,
    };
  }
  if (statusId === 'in_review') {
    return {
      id: 'in_review',
      label: 'In Review',
      ...THEME_COLOR_MAP.amber,
      isCompleted: false,
      isArchived: false,
    };
  }
  if (statusId === 'archived') {
    return {
      id: 'archived',
      label: 'Arsip (Archived)',
      ...THEME_COLOR_MAP.slate,
      isCompleted: false,
      isArchived: true,
    };
  }

  return {
    id: statusId,
    label: statusId.charAt(0).toUpperCase() + statusId.slice(1).replace(/_/g, ' '),
    ...THEME_COLOR_MAP.slate,
    isCompleted: false,
    isArchived: false,
  };
}

export function getPriorityMeta(priorityId: string, settings?: TaskCustomSettings) {
  const custom = settings?.priorities?.find((p) => p.id === priorityId);
  if (custom) {
    const style = THEME_COLOR_MAP[custom.color] || THEME_COLOR_MAP.amber;
    return {
      id: custom.id,
      label: custom.label,
      badgeBg: style.badgeBg,
      badgeText: style.badgeText,
      badgeBorder: style.borderColor,
      dotColor: style.dotColor,
    };
  }

  if (priorityId === 'urgent') {
    return {
      id: 'urgent',
      label: 'Urgent Priority',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-600',
      badgeBorder: 'border-rose-200/80',
      dotColor: 'bg-rose-500',
    };
  }
  if (priorityId === 'low') {
    return {
      id: 'low',
      label: 'Low Priority',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-600',
      badgeBorder: 'border-emerald-200/80',
      dotColor: 'bg-emerald-500',
    };
  }

  return {
    id: priorityId || 'moderate',
    label: priorityId === 'moderate' ? 'Moderate Priority' : (priorityId ? priorityId.charAt(0).toUpperCase() + priorityId.slice(1) : 'Moderate Priority'),
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    badgeBorder: 'border-amber-200/80',
    dotColor: 'bg-amber-500',
  };
}

export function getCategoryMeta(categoryName: string, settings?: TaskCustomSettings) {
  const trimmed = (categoryName || '').trim();
  const custom = settings?.categories?.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (custom && custom.color) {
    const style = THEME_COLOR_MAP[custom.color] || THEME_COLOR_MAP.indigo;
    return {
      id: custom.id,
      name: custom.name,
      badgeBg: style.badgeBg,
      badgeText: style.badgeText,
      borderColor: style.borderColor,
      dotColor: style.dotColor,
    };
  }

  return {
    id: trimmed || 'general',
    name: trimmed || 'Umum',
    badgeBg: 'bg-indigo-50/70',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-100',
    dotColor: 'bg-indigo-500',
  };
}
