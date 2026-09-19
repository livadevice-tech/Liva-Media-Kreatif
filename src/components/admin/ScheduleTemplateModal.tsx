import React, { useState } from "react";
import {
  X,
  Bookmark,
  Calendar,
  Save,
  Play,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import type { ScheduleTemplate, ScheduleTemplateSlot, ShiftSchedule, StudioItem, HostEmployee, ClientBrand } from "../../types";
import { CustomDatePicker } from "../ui/CustomDatePicker";

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

interface ScheduleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ScheduleTemplate[];
  onSaveTemplates: (templates: ScheduleTemplate[]) => Promise<void>;
  currentWeekStartDate: Date;
  computedSchedules: ShiftSchedule[];
  hosts: HostEmployee[];
  studios: StudioItem[];
  clientBrands: ClientBrand[];
  onApplyTemplate: (
    template: ScheduleTemplate,
    targetStartDate: string,
    targetEndDate: string,
    overwrite: boolean
  ) => Promise<void>;
}

export const ScheduleTemplateModal: React.FC<ScheduleTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSaveTemplates,
  currentWeekStartDate,
  computedSchedules,
  hosts,
  onApplyTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "save_current">("list");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    templates[0]?.id || null
  );

  // Apply dialog states
  const [targetStartDate, setTargetStartDate] = useState<string>(() => {
    const d = new Date(currentWeekStartDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dateStr = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dateStr}`;
  });

  const [targetEndDate, setTargetEndDate] = useState<string>(() => {
    const d = new Date(currentWeekStartDate);
    d.setDate(d.getDate() + 6);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dateStr = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dateStr}`;
  });

  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  // Save new template states
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [newTemplateDesc, setNewTemplateDesc] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Compute schedules for the current active week
  const currentWeekSchedules = React.useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStartDate);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dateStr = String(d.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${dateStr}`);
    }
    const validDates = new Set(dates);
    return computedSchedules.filter((s) => {
      const d = (s.date || "").split("T")[0];
      return validDates.has(d);
    });
  }, [currentWeekStartDate, computedSchedules]);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  const handleSaveCurrentWeekAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) {
      alert("Masukkan nama template jadwal!");
      return;
    }

    if (currentWeekSchedules.length === 0) {
      alert("Tidak ada jadwal di minggu saat ini untuk disimpan sebagai template.");
      return;
    }

    setIsSaving(true);
    try {
      // Map current week schedules to template slots (0 = Senin, ..., 6 = Minggu)
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStartDate);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dateStr = String(d.getDate()).padStart(2, "0");
        weekDates.push(`${y}-${m}-${dateStr}`);
      }

      const slots: ScheduleTemplateSlot[] = [];
      currentWeekSchedules.forEach((sched) => {
        const schedDate = (sched.date || "").split("T")[0];
        const dayIdx = weekDates.indexOf(schedDate);
        if (dayIdx >= 0) {
          slots.push({
            dayOfWeek: dayIdx,
            hostId: sched.hostId,
            hostName: sched.hostName,
            employeeId: sched.employeeId,
            timeSlot: sched.timeSlot,
            platform: sched.platform,
            brand: sched.brand,
            studio: sched.studio || "",
          });
        }
      });

      const newTpl: ScheduleTemplate = {
        id: `tpl_${Date.now()}`,
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim() || undefined,
        slots,
        createdAt: new Date().toISOString(),
      };

      const updated = [newTpl, ...templates];
      await onSaveTemplates(updated);
      setSelectedTemplateId(newTpl.id);
      setNewTemplateName("");
      setNewTemplateDesc("");
      setActiveTab("list");
    } catch (err) {
      console.error("Gagal menyimpan template:", err);
      alert("Gagal menyimpan template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;

    const updated = templates.filter((t) => t.id !== templateId);
    await onSaveTemplates(updated);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(updated[0]?.id || null);
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;
    if (!targetStartDate || !targetEndDate) {
      alert("Pilih periode tanggal mulai dan akhir.");
      return;
    }
    if (targetStartDate > targetEndDate) {
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }

    setIsApplying(true);
    setApplySuccessMsg(null);
    try {
      await onApplyTemplate(
        selectedTemplate,
        targetStartDate,
        targetEndDate,
        overwriteExisting
      );
      setApplySuccessMsg(
        `Jadwal dari template "${selectedTemplate.name}" berhasil diterapkan untuk periode ${targetStartDate} s.d. ${targetEndDate}!`
      );
      setTimeout(() => {
        setApplySuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error applying template:", err);
      alert("Terjadi kesalahan saat menerapkan template.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Template Settingan Jadwal
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {templates.length} Tersedia
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Simpan formasi jadwal host & brand untuk digunakan berulang kali di minggu/bulan mendatang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "list"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Daftar Template ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("save_current")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "save_current"
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Jadwal Minggu Ini ({currentWeekSchedules.length} Sesi)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {applySuccessMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{applySuccessMsg}</span>
            </div>
          )}

          {activeTab === "save_current" ? (
            <form onSubmit={handleSaveCurrentWeekAsTemplate} className="space-y-4 max-w-xl mx-auto py-2">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900">
                      Simpan Jadwal Minggu Aktif Sebagai Template
                    </h4>
                    <p className="text-[11px] text-indigo-700 mt-1 leading-relaxed">
                      Sistem akan menduplikasi <strong>{currentWeekSchedules.length} sesi jadwal</strong> pada minggu
                      terpilih (Senin–Minggu) beserta alokasi host, shift, brand, dan studio ke dalam template yang
                      siap dipakai kapan saja.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Template <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Formasi Standar Reguler, Jadwal Ramadhan, dll"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Keterangan / Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Jadwal rotasi 4 shift harian dengan 8 streamer utama"
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || currentWeekSchedules.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-200 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Menyimpan..." : "Simpan Template"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: List of Templates */}
              <div className="md:col-span-5 space-y-2 border-r border-slate-100 pr-0 md:pr-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Pilih Template
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("save_current")}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" /> Buat Baru
                  </button>
                </div>

                {templates.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Belum Ada Template</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">
                      Simpan settingan jadwal dari minggu yang sudah rapi untuk digunakan kembali.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("save_current")}
                      className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {templates.map((tpl) => {
                      const isSelected = tpl.id === selectedTemplateId;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => setSelectedTemplateId(tpl.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20"
                              : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-xs font-bold truncate ${
                                  isSelected ? "text-blue-900" : "text-slate-800"
                                }`}
                              >
                                {tpl.name}
                              </h4>
                              {tpl.description && (
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {tpl.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1 text-slate-600 font-semibold bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  {tpl.slots.length} Sesi
                                </span>
                                <span>
                                  {new Date(tpl.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              title="Hapus Template"
                              onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Template Detail & Apply Action */}
              <div className="md:col-span-7 flex flex-col justify-between">
                {selectedTemplate ? (
                  <div className="space-y-4">
                    {/* Header Detail */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">
                          {selectedTemplate.name}
                        </h4>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                          {selectedTemplate.slots.length} Total Sesi
                        </span>
                      </div>
                      {selectedTemplate.description && (
                        <p className="text-xs text-slate-600 mt-1">
                          {selectedTemplate.description}
                        </p>
                      )}

                      {/* Day summary badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200/60">
                        {DAYS_OF_WEEK.map((dayName, idx) => {
                          const count = selectedTemplate.slots.filter(
                            (s) => s.dayOfWeek === idx
                          ).length;
                          return (
                            <span
                              key={dayName}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                count > 0
                                  ? "bg-white text-slate-700 border-slate-200"
                                  : "bg-slate-100 text-slate-400 border-transparent opacity-60"
                              }`}
                            >
                              {dayName}: <strong>{count}</strong>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview of slots */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Pratinjau Sesi Terjadwal:
                      </span>
                      <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white text-xs">
                        {selectedTemplate.slots.map((slot, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 flex items-center justify-between hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-12 text-[10px] font-bold text-slate-500">
                                {DAYS_OF_WEEK[slot.dayOfWeek]}
                              </span>
                              <span className="font-bold text-slate-800">
                                {slot.hostName}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-blue-600 font-semibold text-[11px]">
                                {slot.brand}
                              </span>
                            </div>
                            <div className="text-right text-[10px] text-slate-500 font-medium">
                              <span>{slot.timeSlot}</span>
                              {slot.studio && (
                                <span className="ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                  {slot.studio}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Configuration Form */}
                    <div className="p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 rounded-2xl space-y-3 mt-2">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                        Terapkan Template ke Kalender
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Tanggal Mulai
                          </label>
                          <CustomDatePicker
                            value={targetStartDate}
                            onChange={(val) => setTargetStartDate(val)}
                            className="w-full text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Tanggal Selesai
                          </label>
                          <CustomDatePicker
                            value={targetEndDate}
                            onChange={(val) => setTargetEndDate(val)}
                            className="w-full text-xs font-bold"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                        <input
                          type="checkbox"
                          checked={overwriteExisting}
                          onChange={(e) => setOverwriteExisting(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          Gantikan / Reset jadwal yang ada pada periode tanggal di atas
                        </span>
                      </label>

                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={isApplying}
                          onClick={handleApply}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          {isApplying
                            ? "Menerapkan Jadwal..."
                            : `Terapkan Template "${selectedTemplate.name}"`}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
                    <p className="text-xs">Pilih template di sebelah kiri untuk melihat detail atau menerapkannya.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
