import { Edit2, Plus, Search, Trash2, Users } from "lucide-react";

import type { ClientLead } from "../../types";

interface LeadPipelinePanelProps {
  leads: ClientLead[];
  leadSearchQuery: string;
  onLeadSearchQueryChange: (value: string) => void;
  onCreateLead: () => void;
  onEditLead: (lead: ClientLead) => void;
  onDeleteLead: (lead: ClientLead) => void;
  onStatusChange: (leadId: string, status: ClientLead["status"]) => void;
}

export function LeadPipelinePanel({
  leads,
  leadSearchQuery,
  onLeadSearchQueryChange,
  onCreateLead,
  onEditLead,
  onDeleteLead,
  onStatusChange,
}: LeadPipelinePanelProps) {
  const filteredLeads = leads.filter(
    (lead) =>
      leadSearchQuery === "" ||
      lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      (lead.contactPerson || "")
        .toLowerCase()
        .includes(leadSearchQuery.toLowerCase()) ||
      (lead.contactNumber || "")
        .toLowerCase()
        .includes(leadSearchQuery.toLowerCase()),
  );

  return (
    <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Pipeline Leads & Calon
            Klien
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Tracking status penawaran harga & dealing Liva Agency.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lead..."
              value={leadSearchQuery}
              onChange={(e) => onLeadSearchQueryChange(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={onCreateLead}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all border-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Lead Baru
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-50 bg-white shadow-sm font-sans">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-indigo-50/50 border-b border-indigo-50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                No
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                Nama Leads
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                Brand
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                Status Leads
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                Channel
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">
                Contact (HP/Email)
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {leads.length === 0 ? (
              <tr key="empty-all">
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/20"
                >
                  Belum ada pipeline leads tersedia. Tambahkan data lead baru.
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr key="empty-search">
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/20"
                >
                  Tidak ada lead yang cocok dengan pencarian "{leadSearchQuery}".
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead, idx) => (
                <tr
                  key={lead.id || idx}
                  className="hover:bg-indigo-50/30 transition-colors"
                >
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-indigo-950 text-sm mb-1">
                      {lead.contactPerson || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800 text-sm bg-slate-100/50 px-2.5 py-1 rounded-lg inline-block border border-slate-200/60 shadow-sm">
                      {lead.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`text-[10px] font-extrabold border-2 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer ${
                        lead.status === "Closed Won"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : lead.status === "Closed Lost"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : lead.status === "Negotiation"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-white text-indigo-700 border-indigo-100"
                      }`}
                      value={lead.status}
                      onChange={(e) =>
                        onStatusChange(lead.id, e.target.value as ClientLead["status"])
                      }
                    >
                      <option value="New">🏷️ New</option>
                      <option value="Contacted">📞 Contacted</option>
                      <option value="Meeting Scheduled">📅 Meeting Scheduled</option>
                      <option value="Proposal Sent">📤 Proposal Sent</option>
                      <option value="Negotiation">💬 Negotiation</option>
                      <option value="Closed Won">🎉 Closed Won</option>
                      <option value="Closed Lost">❌ Closed Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md inline-block">
                      {lead.platformInterest}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                      {lead.contactNumber || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEditLead(lead)}
                        className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-2 text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-none border-0 flex items-center gap-1.5"
                        title="Edit Lead"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteLead(lead)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-none border-0 flex items-center gap-1.5"
                        title="Hapus Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
