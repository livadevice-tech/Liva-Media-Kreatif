import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, ArrowLeftRight, CheckCircle2, XCircle, AlertCircle,
  Search, Filter, RefreshCw, FileText, Download, Plus, Eye, Trash2,
  Check, X, Sparkles, User, MessageSquare, ChevronDown, ExternalLink
} from 'lucide-react';
import { hostRequestsApi } from '../../api';
import type { HostScheduleRequest, HostEmployee } from '../../types';

interface HostRequestsManagerProps {
  hosts: HostEmployee[];
  loggedInAdminName?: string;
  onRefreshSchedules?: () => void;
}

export function HostRequestsManager({
  hosts,
  loggedInAdminName = 'Administrator',
  onRefreshSchedules,
}: HostRequestsManagerProps) {
  const [requests, setRequests] = useState<HostScheduleRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [typeFilter, setTypeFilter] = useState<string>('Semua');
  const [hostFilter, setHostFilter] = useState<string>('Semua');
  const [dateFilterStart, setDateFilterStart] = useState<string>('');
  const [dateFilterEnd, setDateFilterEnd] = useState<string>('');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<HostScheduleRequest | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'in_review' | 'rejected' | 'edit_note' | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Manual Create Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualHostId, setManualHostId] = useState('');
  const [manualType, setManualType] = useState<'izin' | 'tukar_jadwal'>('izin');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualEndDate, setManualEndDate] = useState('');
  const [manualReasonCategory, setManualReasonCategory] = useState('Izin Resmi');
  const [manualCurrentShift, setManualCurrentShift] = useState('Shift 1 (08:00 - 12:00)');
  const [manualTargetDate, setManualTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualTargetShift, setManualTargetShift] = useState('Shift 2 (13:00 - 17:00)');
  const [manualNotes, setManualNotes] = useState('');
  const [manualStatus, setManualStatus] = useState<'approved' | 'pending'>('approved');

  // Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Load requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await hostRequestsApi.getAll();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load host requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const inReview = requests.filter((r) => r.status === 'in_review').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    const izinCount = requests.filter((r) => r.type === 'izin').length;
    const tukarCount = requests.filter((r) => r.type === 'tukar_jadwal').length;

    return { total, pending, inReview, approved, rejected, izinCount, tukarCount };
  }, [requests]);

  // Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'Semua' && r.status !== statusFilter) return false;
      if (typeFilter !== 'Semua' && r.type !== typeFilter) return false;
      if (hostFilter !== 'Semua' && r.hostId !== hostFilter) return false;
      if (dateFilterStart && r.date < dateFilterStart) return false;
      if (dateFilterEnd && r.date > dateFilterEnd) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHost = (r.hostName || '').toLowerCase().includes(q);
        const matchNotes = (r.notes || '').toLowerCase().includes(q);
        const matchReason = (r.reasonCategory || '').toLowerCase().includes(q);
        const matchShift = (r.currentShift || '').toLowerCase().includes(q) || (r.targetShift || '').toLowerCase().includes(q);
        if (!matchHost && !matchNotes && !matchReason && !matchShift) return false;
      }

      return true;
    });
  }, [requests, statusFilter, typeFilter, hostFilter, dateFilterStart, dateFilterEnd, searchQuery]);

  // Handle Review action execution
  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    setSubmittingReview(true);

    try {
      const newStatus = actionType === 'edit_note' ? selectedRequest.status : actionType;
      await hostRequestsApi.update(selectedRequest.id, {
        status: newStatus,
        adminNotes: adminNoteInput,
        reviewedBy: loggedInAdminName,
      });

      setSelectedRequest(null);
      setActionType(null);
      setAdminNoteInput('');
      loadRequests();
      if (onRefreshSchedules) onRefreshSchedules();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui status pengajuan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Open action review modal
  const openActionModal = (req: HostScheduleRequest, action: 'approved' | 'in_review' | 'rejected' | 'edit_note') => {
    setSelectedRequest(req);
    setActionType(action);
    setAdminNoteInput(req.adminNotes || '');
  };

  // Delete Request
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan pengajuan ini?')) return;
    try {
      await hostRequestsApi.delete(id);
      loadRequests();
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus pengajuan.');
    }
  };

  // Submit Manual Request by Admin
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHostId) {
      alert('Pilih host terlebih dahulu.');
      return;
    }
    const hostObj = hosts.find((h) => h.id === manualHostId);
    if (!hostObj) return;

    try {
      await hostRequestsApi.create({
        hostId: hostObj.id,
        hostName: hostObj.name,
        employeeId: hostObj.employeeId,
        type: manualType,
        status: manualStatus,
        date: manualDate,
        endDate: manualEndDate || undefined,
        reasonCategory: manualType === 'izin' ? manualReasonCategory : undefined,
        currentShift: manualType === 'tukar_jadwal' ? manualCurrentShift : undefined,
        targetDate: manualType === 'tukar_jadwal' ? manualTargetDate : undefined,
        targetShift: manualType === 'tukar_jadwal' ? manualTargetShift : undefined,
        notes: manualNotes,
        reviewedBy: loggedInAdminName,
      });

      setIsManualModalOpen(false);
      setManualNotes('');
      loadRequests();
    } catch (err: any) {
      alert(err?.message || 'Gagal membuat pengajuan.');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      alert('Tidak ada data pengajuan untuk diexport.');
      return;
    }

    const headers = [
      'ID', 'Tipe', 'Host', 'Employee ID', 'Tanggal Pengajuan',
      'Tanggal Izin / Jadwal Asal', 'Tanggal Selesai', 'Kategori', 'Shift Asal',
      'Shift Target', 'Tanggal Target', 'Host Pengganti', 'Alasan',
      'Status', 'Catatan Admin', 'Ditinjau Oleh', 'Waktu Tinjauan'
    ];

    const rows = filteredRequests.map((r) => [
      `"${r.id}"`,
      `"${r.type === 'izin' ? 'Izin / Cuti' : 'Tukar Jadwal'}"`,
      `"${r.hostName}"`,
      `"${r.employeeId || ''}"`,
      `"${r.createdAt || ''}"`,
      `"${r.date}"`,
      `"${r.endDate || ''}"`,
      `"${r.reasonCategory || ''}"`,
      `"${r.currentShift || ''}"`,
      `"${r.targetShift || ''}"`,
      `"${r.targetDate || ''}"`,
      `"${r.replacementHostName || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${(r.adminNotes || '').replace(/"/g, '""')}"`,
      `"${r.reviewedBy || ''}"`,
      `"${r.reviewedAt || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_pengajuan_host_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-700/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Calendar className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  Fitur Rekap Roster Host
                </span>
                {stats.pending > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 animate-pulse">
                    {stats.pending} Perlu Tinjauan
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Pengajuan Izin & Tukar Jadwal Host
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium mt-1 max-w-2xl leading-relaxed">
                Pusat manajemen permohonan izin sakit/cuti dan request pergantian shift siaran yang diajukan oleh akun host.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Catat Manual
            </button>
            <button
              type="button"
              onClick={loadRequests}
              className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Pengajuan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Masuk</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {stats.izinCount} Izin • {stats.tukarCount} Tukar
          </div>
        </div>

        {/* Menunggu Tinjauan */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-400" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Menunggu</span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Belum Diproses</div>
        </div>

        {/* Sedang Ditinjau */}
        <div className="bg-white rounded-2xl p-4 border border-indigo-200/80 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Ditinjau</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.inReview}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Dalam Proses</div>
        </div>

        {/* Diterima / Disetujui */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Disetujui</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.approved}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Permohonan Diterima</div>
        </div>

        {/* Ditolak */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-2xs relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Ditolak</span>
            <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.rejected}</div>
          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Tidak Diizinkan</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama host, catatan, atau shift..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'Semua', label: 'Semua' },
              { id: 'pending', label: 'Menunggu' },
              { id: 'in_review', label: 'Ditinjau' },
              { id: 'approved', label: 'Diterima' },
              { id: 'rejected', label: 'Ditolak' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extended Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Tipe Pengajuan */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tipe Pengajuan
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="Semua">Semua Tipe</option>
              <option value="izin">Izin / Cuti</option>
              <option value="tukar_jadwal">Tukar Jadwal</option>
            </select>
          </div>

          {/* Filter Host */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Pilih Host
            </span>
            <select
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="Semua">Semua Host ({hosts.length})</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Tanggal Dari */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Dari Tanggal
            </span>
            <input
              type="date"
              value={dateFilterStart}
              onChange={(e) => setDateFilterStart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            />
          </div>

          {/* Tanggal Sampai */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sampai Tanggal
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateFilterEnd}
                onChange={(e) => setDateFilterEnd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
              />
              {(dateFilterStart || dateFilterEnd || hostFilter !== 'Semua' || typeFilter !== 'Semua') && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFilterStart('');
                    setDateFilterEnd('');
                    setHostFilter('Semua');
                    setTypeFilter('Semua');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                  title="Reset Filter"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">Memuat data pengajuan host...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-700">Tidak Ada Pengajuan Ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tidak ada pengajuan izin atau tukar jadwal yang cocok dengan filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => {
              const isIzin = req.type === 'izin';
              const isPending = req.status === 'pending';
              const isInReview = req.status === 'in_review';
              const isApproved = req.status === 'approved';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Host & Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0 shadow-2xs">
                      {req.hostName.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Host Name & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-slate-800">
                          {req.hostName}
                        </span>
                        {req.employeeId && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            ({req.employeeId})
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isIzin
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {isIzin ? 'Izin / Cuti' : 'Tukar Jadwal'}
                        </span>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" /> Menunggu Tinjauan
                          </span>
                        )}
                        {isInReview && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                            <Sparkles className="w-3 h-3 text-indigo-600" /> Sedang Ditinjau
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Diterima
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" /> Ditolak
                          </span>
                        )}
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {isIzin ? (
                          <>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                Tanggal Izin
                              </span>
                              <span className="font-bold text-slate-800">
                                {req.date} {req.endDate ? `s.d. ${req.endDate}` : ''}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                Kategori
                              </span>
                              <span className="font-bold text-indigo-600">
                                {req.reasonCategory || 'Izin Umum'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                Jadwal Asal
                              </span>
                              <span className="font-bold text-slate-800">
                                {req.date} • {req.currentShift || 'Shift'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide block">
                                Permintaan Shift Baru
                              </span>
                              <span className="font-bold text-indigo-700">
                                {req.targetDate || req.date} • {req.targetShift || '-'}
                              </span>
                            </div>
                            {req.replacementHostName && (
                              <div className="md:col-span-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                  Tukar dengan Rekan Host
                                </span>
                                <span className="font-semibold text-slate-800">
                                  {req.replacementHostName}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {/* Alasan Host */}
                        {req.notes && (
                          <div className="md:col-span-2 pt-1 border-t border-slate-200/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                              Alasan Pengajuan
                            </span>
                            <p className="text-slate-700 font-medium leading-relaxed">
                              "{req.notes}"
                            </p>
                          </div>
                        )}

                        {/* Lampiran Foto / Bukti Surat Sakit */}
                        {req.proofUrl && (
                          <div className="md:col-span-2 pt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewImageUrl(req.proofUrl!)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Lampiran / Surat Dokter
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Catatan Admin jika sudah ada */}
                      {req.adminNotes && (
                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                            Catatan Admin:
                          </span>
                          <p className="mt-0.5 font-medium italic">"{req.adminNotes}"</p>
                          {req.reviewedBy && (
                            <span className="text-[10px] text-amber-700 block mt-1 font-semibold">
                              Oleh {req.reviewedBy} {req.reviewedAt ? `pada ${req.reviewedAt}` : ''}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400">
                        Diajukan pada: {req.createdAt ? new Date(req.createdAt).toLocaleString('id-ID') : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {/* Terima Button */}
                      <button
                        type="button"
                        onClick={() => openActionModal(req, 'approved')}
                        disabled={isApproved}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-300 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                        title="Terima Pengajuan"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Terima</span>
                      </button>

                      {/* Tinjau Button */}
                      <button
                        type="button"
                        onClick={() => openActionModal(req, 'in_review')}
                        disabled={isInReview}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isInReview
                            ? 'bg-indigo-50 text-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}
                        title="Tandai Sedang Ditinjau"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tinjau</span>
                      </button>

                      {/* Tolak Button */}
                      <button
                        type="button"
                        onClick={() => openActionModal(req, 'rejected')}
                        disabled={isRejected}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isRejected
                            ? 'bg-rose-50 text-rose-300 cursor-not-allowed'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                        title="Tolak Pengajuan"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tolak</span>
                      </button>

                      {/* Hapus Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Hapus Rekap Pengajuan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {req.adminNotes && (
                      <button
                        type="button"
                        onClick={() => openActionModal(req, 'edit_note')}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" /> Edit Catatan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL TINJAU / TERIMA / TOLAK ================= */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                    actionType === 'approved'
                      ? 'bg-emerald-600'
                      : actionType === 'rejected'
                      ? 'bg-rose-600'
                      : 'bg-indigo-600'
                  }`}
                >
                  {actionType === 'approved' && <Check className="w-5 h-5 stroke-[2.5]" />}
                  {actionType === 'rejected' && <X className="w-5 h-5 stroke-[2.5]" />}
                  {(actionType === 'in_review' || actionType === 'edit_note') && <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    {actionType === 'approved' && 'Terima / Setujui Pengajuan'}
                    {actionType === 'rejected' && 'Tolak Pengajuan'}
                    {actionType === 'in_review' && 'Tandai Sedang Ditinjau'}
                    {actionType === 'edit_note' && 'Ubah Catatan Tanggapan'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Host: {selectedRequest.hostName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedRequest(null); setActionType(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 text-xs border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Detail Pengajuan:</span>
                <p className="font-semibold text-slate-700 mt-0.5">
                  {selectedRequest.type === 'izin'
                    ? `Izin (${selectedRequest.reasonCategory || 'Umum'}) tanggal ${selectedRequest.date}`
                    : `Tukar shift ${selectedRequest.date} (${selectedRequest.currentShift || ''}) ke ${selectedRequest.targetDate || selectedRequest.date} (${selectedRequest.targetShift || ''})`}
                </p>
                {selectedRequest.notes && (
                  <p className="text-slate-500 mt-1 italic">"{selectedRequest.notes}"</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan / Tanggapan untuk Host (Akan muncul di akun host):
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder={
                    actionType === 'approved'
                      ? 'Contoh: Disetujui, silakan istirahat / jadwal telah disesuaikan.'
                      : actionType === 'rejected'
                      ? 'Contoh: Maaf, tidak ada host pengganti yang tersedia pada shift tersebut.'
                      : 'Tuliskan catatan arahan atau pertanyaan untuk host...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedRequest(null); setActionType(null); }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={handleConfirmAction}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                    actionType === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionType === 'rejected'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {submittingReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Konfirmasi & Simpan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH MANUAL OLEH ADMIN ================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-scaleUp">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Catat Pengajuan Manual</h4>
                  <p className="text-xs text-slate-400">Input izin atau tukar shift yang dikonfirmasi via WA/offline</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              {/* Host Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Host</label>
                <select
                  required
                  value={manualHostId}
                  onChange={(e) => setManualHostId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="">-- Pilih Host --</option>
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} {h.employeeId ? `(${h.employeeId})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Tipe Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Pengajuan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('izin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      manualType === 'izin'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Izin / Cuti
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('tukar_jadwal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      manualType === 'tukar_jadwal'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Tukar Jadwal
                  </button>
                </div>
              </div>

              {/* Detail fields based on type */}
              {manualType === 'izin' ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Mulai Izin</span>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Selesai (Opsional)</span>
                      <input
                        type="date"
                        value={manualEndDate}
                        onChange={(e) => setManualEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Kategori Izin</span>
                    <select
                      value={manualReasonCategory}
                      onChange={(e) => setManualReasonCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Sakit">Sakit</option>
                      <option value="Cuti / Istirahat">Cuti / Libur</option>
                      <option value="Keperluan Keluarga">Keperluan Keluarga</option>
                      <option value="Pendidikan / Ujian">Pendidikan / Ujian</option>
                      <option value="Keadaan Darurat">Keadaan Darurat</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Asal</span>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Shift Asal</span>
                      <input
                        type="text"
                        value={manualCurrentShift}
                        onChange={(e) => setManualCurrentShift(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Tanggal Target</span>
                      <input
                        type="date"
                        required
                        value={manualTargetDate}
                        onChange={(e) => setManualTargetDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">Shift Target</span>
                      <input
                        type="text"
                        value={manualTargetShift}
                        onChange={(e) => setManualTargetShift(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Status Langsung */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Status Awal</span>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="approved">Langsung Disetujui (Approved)</option>
                  <option value="pending">Menunggu Konfirmasi (Pending)</option>
                </select>
              </div>

              {/* Catatan / Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Alasan</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Keterangan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                >
                  Simpan Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= IMAGE PREVIEW MODAL ================= */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] p-2 bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Lampiran Surat / Bukti Izin"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl"
            />
            <div className="p-3 text-center">
              <a
                href={previewImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Gambar di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default HostRequestsManager;
