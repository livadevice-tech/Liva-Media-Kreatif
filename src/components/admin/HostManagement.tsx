import { useEffect, useRef, useState } from "react";
import { Search, Edit2, Trash2 } from "lucide-react";
import type { HostEmployee, StudioItem } from "../../types";
import { getAvatarUrl } from "../../shared/utils/appUi";
import {
  getHostStudioOptions,
  normalizeHostStudioLocation,
} from "../../shared/utils/hostCredentials";

type SearchableHostSelectProps = {
  hosts: HostEmployee[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  valueType?: "id" | "name";
  includeType?: boolean;
  includeStudio?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
};

export function SearchableHostSelect({
  hosts,
  value,
  onChange,
  placeholder = "-- Pilih Host --",
  className = "",
  triggerClassName = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-left text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer transition-all flex items-center justify-between min-h-[42px]",
  valueType = "id",
  includeType = false,
  includeStudio = false,
  showAllOption = false,
  allOptionLabel = "Semua Host",
}: SearchableHostSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const selectedHost = (hosts || []).find(
    (h) => valueType === "id" ? h.id === value : h.name === value,
  );

  const filteredHosts = (hosts || []).filter(
    (h) =>
      ((h.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (h.studio && h.studio.toLowerCase().includes(search.toLowerCase())) ||
        (h.hostType && h.hostType.toLowerCase().includes(search.toLowerCase()))),
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
      >
        <span className="truncate">
          {showAllOption && value === "all"
            ? allOptionLabel
            : selectedHost
              ? `${selectedHost.name || ""}${
                  includeType && selectedHost.hostType
                    ? ` (${selectedHost.hostType})`
                    : ""
                }${
                  includeStudio && selectedHost.studio
                    ? ` (${selectedHost.studio.replace(/^Studio\s+/, "")})`
                    : ""
                }`
              : placeholder}
        </span>
        <span className="text-[10px] text-slate-400 select-none ml-2 shrink-0">
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-[150] p-2 flex flex-col gap-2 animate-fadeIn origin-top">
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
            {showAllOption && !search && (
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={`w-full px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer ${
                  value === "all"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {allOptionLabel}
              </button>
            )}

            {filteredHosts.length > 0 ? (
              filteredHosts.map((h, i) => {
                const isSelected =
                  valueType === "id" ? h.id === value : h.name === value;
                return (
                  <button
                    key={h.id + "_" + i}
                    type="button"
                    onClick={() =>
                      handleSelect(valueType === "id" ? h.id : h.name)
                    }
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">
                      {h.name || ""}
                      {includeStudio && h.studio && (
                        <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                          ({h.studio.replace(/^Studio\s+/, "")})
                        </span>
                      )}
                    </span>
                    {includeType && h.hostType && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                          h.hostType === "Reguler"
                            ? "bg-indigo-50/50 text-indigo-600 border-indigo-100"
                            : "bg-emerald-50/50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        {h.hostType}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                Host tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type HostCredentialRowProps = {
  host: HostEmployee;
  onUpdate: (id: string, fields: Partial<HostEmployee>) => void;
  onDelete: (id: string) => void;
  studios?: StudioItem[];
  key?: string | number;
};

export function HostCredentialRow({
  host,
  onUpdate,
  onDelete,
  studios = [],
}: HostCredentialRowProps) {
  const studioOptions =
    studios.length > 0
      ? studios.map((std) => std.location)
      : getHostStudioOptions();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(host.name || "");
  const [role, setRole] = useState(host.role || "");
  const [studio, setStudio] = useState(
    normalizeHostStudioLocation(host.studio) || "Bandar Lampung",
  );
  const [phone, setPhone] = useState(host.phone || "");
  const [bankAccount, setBankAccount] = useState(host.bankAccount || "");
  const [bankName, setBankName] = useState(host.bankName || "");
  const [username, setUsername] = useState(host.username || "");
  const [password, setPassword] = useState("");
  const [customWorkingDaysTarget, setCustomWorkingDaysTarget] = useState<number>(
    host.customWorkingDaysTarget || 26,
  );

  useEffect(() => {
    if (isEditing) return;
    setName(host.name || "");
    setRole(host.role || "");
    setStudio(normalizeHostStudioLocation(host.studio) || "Bandar Lampung");
    setPhone(host.phone || "");
    setBankAccount(host.bankAccount || "");
    setBankName(host.bankName || "");
    setUsername(host.username || "");
    setPassword("");
    setCustomWorkingDaysTarget(host.customWorkingDaysTarget || 26);
  }, [host, isEditing]);

  const handleSave = () => {
    onUpdate(host.id, {
      name,
      role,
      hostType: role.toLowerCase().includes("back up") ? "Backup" : "Reguler",
      studio: normalizeHostStudioLocation(studio),
      phone,
      bankAccount,
      bankName,
      username,
      ...(password.trim() ? { password: password.trim() } : {}),
      customWorkingDaysTarget: role.toLowerCase().includes("back up")
        ? undefined
        : customWorkingDaysTarget,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(host.name || "");
    setRole(host.role || "");
    setStudio(normalizeHostStudioLocation(host.studio) || "Bandar Lampung");
    setPhone(host.phone || "");
    setBankAccount(host.bankAccount || "");
    setBankName(host.bankName || "");
    setUsername(host.username || "");
    setPassword("");
    setCustomWorkingDaysTarget(host.customWorkingDaysTarget || 26);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-purple-50/40 transition-colors border-b border-purple-100/65 text-xs text-[#3c2f56]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={getAvatarUrl(host.name)}
            alt={host.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/10 flex-shrink-0"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-xs font-bold text-purple-950 block w-full focus:outline-none focus:border-purple-500"
                  placeholder="Nama Host"
                />
                <span className="text-[9px] text-purple-400 font-bold font-mono block">
                  ID: {host.employeeId}
                </span>
              </div>
            ) : (
              <div>
                <span className="font-extrabold text-purple-950 text-xs block">
                  {host.name}
                </span>
                <span className="text-[9px] text-purple-400 font-bold font-mono block">
                  ID: {host.employeeId}
                </span>
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="Reguler Host">Reguler Host</option>
            <option value="Back Up Host">Back Up Host</option>
          </select>
        ) : (
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-extrabold text-[9.5px] uppercase border border-purple-100/40">
            {host.role}
          </span>
        )}
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <select
            value={studio}
            onChange={(e) => setStudio(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {studioOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        ) : (
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100/45 font-extrabold text-[9.5px] uppercase">
            {normalizeHostStudioLocation(host.studio) || "Bandar Lampung"}
          </span>
        )}
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <div className="space-y-2">
            <div>
              <label className="text-[9px] text-purple-900 font-bold block mb-0.5">Nama Bank:</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-[10px] font-bold text-purple-950 w-full focus:outline-none focus:border-purple-500"
                placeholder="BCA"
              />
            </div>
            <div>
              <label className="text-[9px] text-purple-900 font-bold block mb-0.5">No Rekening:</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-[10px] font-bold text-purple-950 w-full focus:outline-none focus:border-purple-500"
                placeholder="123456"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-[10px] text-[#3c2f56] font-bold">
              {host.bankName ? (
                <>
                  <span className="font-black text-purple-700">{host.bankName}</span> - {host.bankAccount || "-"}
                </>
              ) : (
                <span className="text-slate-400 italic">Belum diset</span>
              )}
            </div>
            {host.phone && (
              <div className="text-[9px] text-slate-500 font-mono font-semibold">
                📱 {host.phone}
              </div>
            )}
          </div>
        )}
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 font-bold text-xs w-28"
            placeholder="username"
          />
        ) : (
          <code className="bg-purple-50 px-2 py-1 rounded text-purple-650 font-mono font-bold text-[11px] border border-purple-100/30">
            {host.username}
          </code>
        )}
      </td>

      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 font-mono text-xs font-bold w-28"
            placeholder={
              host.hasPassword || host.password
                ? "Kosongkan untuk tetap memakai password lama"
                : "Masukkan password baru"
            }
          />
        ) : (
          <code className="bg-purple-50 px-2 py-1 rounded text-purple-650 font-mono font-bold text-[11px] border border-purple-100/30">
            {host.hasPassword || host.password
              ? "Password tersimpan"
              : "Belum di-set"}
          </code>
        )}
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs cursor-pointer transition-all"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-750 transition-all cursor-pointer"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/60 rounded-lg border border-purple-100/40 transition-all cursor-pointer"
                title="Edit Host"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(host.id);
                }}
                className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100/60 rounded-lg border border-red-100/40 transition-all cursor-pointer"
                title="Hapus Host"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
