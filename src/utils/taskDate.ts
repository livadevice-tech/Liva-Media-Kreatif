/**
 * Utility helper to compute deadline information and remaining days countdown for tasks.
 */
export interface DeadlineInfo {
  text: string;
  diffDays: number;
  isOverdue: boolean;
  isToday: boolean;
  colorClass: string;
  badgeClass: string;
}

export function getDeadlineInfo(dueDateStr?: string, status?: string): DeadlineInfo | null {
  if (!dueDateStr) return null;

  try {
    const cleanStr = dueDateStr.slice(0, 10);
    const parts = cleanStr.split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const targetDate = new Date(year, month, day);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (status === 'done') {
      return {
        text: 'Done',
        diffDays,
        isOverdue: false,
        isToday: false,
        colorClass: 'text-emerald-600',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
      };
    }

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      const label = overdueDays === 1 ? '1 Day overdue' : `${overdueDays} Days overdue`;
      return {
        text: label,
        diffDays,
        isOverdue: true,
        isToday: false,
        colorClass: 'text-rose-600 font-semibold',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold',
      };
    }

    if (diffDays === 0) {
      return {
        text: 'Today',
        diffDays: 0,
        isOverdue: false,
        isToday: true,
        colorClass: 'text-amber-700 font-semibold',
        badgeClass: 'bg-amber-100 text-amber-900 border border-amber-200 font-semibold',
      };
    }

    if (diffDays === 1) {
      return {
        text: '1 Day left',
        diffDays: 1,
        isOverdue: false,
        isToday: false,
        colorClass: 'text-amber-700 font-medium',
        badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200/60 font-medium',
      };
    }

    // 2 days or more left (e.g. "12 Days left")
    const label = `${diffDays} Days left`;
    return {
      text: label,
      diffDays,
      isOverdue: false,
      isToday: false,
      colorClass: diffDays <= 3 ? 'text-amber-700 font-medium' : 'text-slate-500',
      badgeClass:
        diffDays <= 3
          ? 'bg-amber-50 text-amber-800 border border-amber-200/60 font-medium'
          : 'bg-slate-100 text-slate-600 border border-slate-200/50 font-medium',
    };
  } catch {
    return null;
  }
}
