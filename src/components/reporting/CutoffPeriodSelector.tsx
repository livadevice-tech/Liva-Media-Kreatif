import React from "react";
import {
  formatCutoffPeriodNote,
  formatCutoffPeriodOptionLabel,
} from "../../shared/utils/reporting";

type CutoffPeriodSelectorProps = {
  id: string;
  value: string;
  availableCutoffMonths: string[];
  onChange: (value: string) => void;
  label?: string;
  showNote?: boolean;
  startDay?: number;
  endDay?: number;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  noteClassName?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const CutoffPeriodSelector: React.FC<CutoffPeriodSelectorProps> = ({
  id,
  value,
  availableCutoffMonths,
  onChange,
  label,
  showNote = false,
  startDay = 16,
  endDay = 15,
  containerClassName,
  labelClassName,
  selectClassName,
  noteClassName,
  icon,
  rightIcon,
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center w-full min-w-0">
        {icon && <div className="shrink-0 flex items-center pointer-events-none">{icon}</div>}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClassName}
        >
          <option value="Semua">Semua Riwayat (Tanpa Filter)</option>
          {availableCutoffMonths.map((period) => (
            <option key={period} value={period}>
              {formatCutoffPeriodOptionLabel(period)}
            </option>
          ))}
        </select>
        {rightIcon && <div className="shrink-0 flex items-center pointer-events-none">{rightIcon}</div>}
      </div>
      {showNote && value !== "Semua" && (
        <span className={noteClassName}>
          *Menampilkan performa dari {formatCutoffPeriodNote(value, startDay, endDay)}
        </span>
      )}
    </div>
  );
};

