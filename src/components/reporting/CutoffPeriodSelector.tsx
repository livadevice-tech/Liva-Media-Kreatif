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
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <div className="flex gap-1.5 items-center">
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
      </div>
      {showNote && value !== "Semua" && (
        <span className={noteClassName}>
          *Menampilkan performa dari {formatCutoffPeriodNote(value, startDay, endDay)}
        </span>
      )}
    </div>
  );
};
