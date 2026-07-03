import { X, Users } from "lucide-react";
import { createPortal } from "react-dom";

import type { ClientLead } from "../../types";

interface LeadFormModalProps {
  isOpen: boolean;
  lead: Partial<ClientLead>;
  platforms: string[];
  onClose: () => void;
  onSubmit: (lead: ClientLead) => void;
}

export function LeadFormModal({
  isOpen,
  lead,
  platforms,
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-md flex justify-end animate-fadeIn font-sans overflow-hidden">
      <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col animate-slideInRight text-slate-800 border-l border-slate-200">
        <div className="bg-gradient-to-br from-indigo-50 to-white px-5 sm:px-8 py-5 sm:py-6 border-b border-indigo-100 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-indigo-950 leading-tight">
                {lead.id ? "Edit Pipeline Lead" : "Lead Baru"}
              </h4>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-1 sm:mt-0.5 leading-tight">
                Kelola data klien dan update status negosiasi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 p-2 sm:p-2.5 rounded-full transition-all cursor-pointer border-0 shadow-sm flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 w-full overflow-y-auto custom-scrollbar flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSubmit({
                id: lead.id || `cl_${Date.now()}`,
                name: fd.get("name") as string,
                contactPerson: fd.get("contactPerson") as string,
                contactNumber: fd.get("contactNumber") as string,
                platformInterest: fd.get("platformInterest") as string,
                status: fd.get("status") as ClientLead["status"],
                notes: fd.get("notes") as string,
              });
            }}
            className="space-y-5 text-xs font-medium"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                  Nama Brand Klien *
                </label>
                <input
                  required
                  name="name"
                  defaultValue={lead.name}
                  type="text"
                  placeholder="Misal: PT. Liva Agency Kosmetik"
                  className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                    Nama PIC
                  </label>
                  <input
                    name="contactPerson"
                    defaultValue={lead.contactPerson}
                    type="text"
                    placeholder="Misal: Budi / HRD"
                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                  />
                </div>
                <div>
                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                    No. WhatsApp/HP
                  </label>
                  <input
                    name="contactNumber"
                    defaultValue={lead.contactNumber}
                    type="text"
                    placeholder="08..."
                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                    Platform Target
                  </label>
                  <select
                    name="platformInterest"
                    defaultValue={lead.platformInterest || platforms[0]}
                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-[0_2px_10px_rgba(79,70,229,0.03)] cursor-pointer appearance-none"
                  >
                    {platforms.map((p, i) => (
                      <option key={p + "_" + i} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Multi-platform">Multi-platform</option>
                  </select>
                </div>
                <div>
                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                    Status Interaksi
                  </label>
                  <select
                    name="status"
                    defaultValue={lead.status || "New"}
                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-[0_2px_10px_rgba(79,70,229,0.03)] cursor-pointer appearance-none"
                  >
                    <option value="New">🏷️ New Lead</option>
                    <option value="Contacted">📞 Sudah Dihubungi</option>
                    <option value="Meeting Scheduled">📅 Jadwal Meeting</option>
                    <option value="Proposal Sent">📤 Proposal Dikirim</option>
                    <option value="Negotiation">💬 Proses Negosiasi</option>
                    <option value="Closed Won">🎉 Deal / Project Goal</option>
                    <option value="Closed Lost">❌ Gagal / Batal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                  Catatan / Detail
                </label>
                <textarea
                  name="notes"
                  defaultValue={lead.notes}
                  rows={3}
                  className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                  placeholder="Tuliskan detail permintaan klien, budget, hasil meeting, atau catatan lainnya di sini..."
                />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg border border-slate-200 cursor-pointer text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-lg border-0 cursor-pointer text-sm"
              >
                {lead.id ? "Simpan Perbaikan" : "Tambah Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
