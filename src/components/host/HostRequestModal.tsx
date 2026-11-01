import React, { useState, useEffect } from 'react';
import {
  X, Calendar as CalendarIcon, Clock, ArrowLeftRight, CheckCircle2,
  AlertCircle, Upload, Trash2, Send, FileText, Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hostRequestsApi, logsApi } from '../../api';
import type { HostEmployee, ShiftSchedule, HostScheduleRequest } from '../../types';
import { compressImage } from '../../shared/utils/imageCompressor';

interface HostRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: HostEmployee;
  hostSchedules?: ShiftSchedule[];
  allHosts?: HostEmployee[];
  availableShifts?: string[];
  onRequestSubmitted?: () => void;
}

export type HostRequestCategoryType = 'tukar_libur' | 'tukar_shift' | 'izin';

export const REQUEST_CATEGORIES: {
  id: HostRequestCategoryType;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  {
    id: 'tukar_libur',
    label: 'Req/Tukar Hari Libur',
    emoji: '🏖️',
    desc: 'Permohonan jatah hari libur atau tukar off day',
  },
  {
    id: 'tukar_shift',
    label: 'Req/Tukar Shift',
    emoji: '🔄',
    desc: 'Permohonan ganti jam shift atau tukar dengan rekan host',
  },
  {
    id: 'izin',
    label: 'Izin Tidak Masuk',
    emoji: '📋',
    desc: 'Izin berhalangan hadir, sakit, atau ada keperluan mendesak',
  },
];

export default function HostRequestModal({
  isOpen,
  onClose,
  host,
  hostSchedules = [],
  allHosts = [],
  availableShifts = [
    'Shift 1 (08:00 - 12:00)',
    'Shift 2 (13:00 - 17:00)',
    'Shift 3 (18:00 - 22:00)',
    'Shift 4 (22:00 - 02:00)',
  ],
  onRequestSubmitted,
}: HostRequestModalProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'riwayat'>('form');
  const [requestCategory, setRequestCategory] = useState<HostRequestCategoryType>('tukar_libur');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State: Req/Tukar Hari Libur
  const [liburDate, setLiburDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isLiburRange, setIsLiburRange] = useState(false);
  const [liburEndDate, setLiburEndDate] = useState('');
  const [isLiburSwap, setIsLiburSwap] = useState(false);
  const [liburSwapDate, setLiburSwapDate] = useState('');

  // Form State: Req/Tukar Shift
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [shiftCurrentDate, setShiftCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [shiftCurrentSlot, setShiftCurrentSlot] = useState(availableShifts[0] || '');
  const [shiftTargetDate, setShiftTargetDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [shiftTargetSlot, setShiftTargetSlot] = useState(availableShifts[1] || availableShifts[0] || '');
  const [replacementHostId, setReplacementHostId] = useState('');

  // Form State: Izin Tidak Masuk
  const [izinDate, setIzinDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isIzinRange, setIsIzinRange] = useState(false);
  const [izinEndDate, setIzinEndDate] = useState('');

  // Shared Notes & Proof Attachment
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  // Riwayat Pengajuan State
  const [requestsList, setRequestsList] = useState<HostScheduleRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Load history when opening modal or tab switch
  useEffect(() => {
    if (!isOpen) return;
    loadHistory();
  }, [isOpen, host?.id]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await hostRequestsApi.getAll({ hostId: host.id });
      setRequestsList(res || []);
    } catch (err) {
      console.error('Failed to load host requests history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // When host selects an existing registered schedule to swap
  const handleSelectSchedule = (schedId: string) => {
    setSelectedScheduleId(schedId);
    const found = hostSchedules.find((s) => s.id === schedId);
    if (found) {
      setShiftCurrentDate(found.date);
      setShiftCurrentSlot(found.timeSlot || '');
    }
  };

  // Proof file upload handler with automatic compression
  const handleProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.75 });
      setProofFile(compressed.file);
      setProofPreview(compressed.dataUrl);
    } catch (err) {
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    }
  };

  // Submit Handler for all 3 categories
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      let uploadedProofUrl: string | undefined = undefined;
      if (proofFile) {
        try {
          const uploadRes = await logsApi.uploadProof(proofFile);
          uploadedProofUrl = uploadRes.proofUrl;
        } catch (uploadErr) {
          console.warn('Failed to upload proof image, submitting without attachment:', uploadErr);
        }
      }

      const categoryObj = REQUEST_CATEGORIES.find((c) => c.id === requestCategory);
      const categoryLabel = categoryObj?.label || 'Izin Tidak Masuk';

      let dateVal = izinDate;
      let endDateVal: string | undefined = undefined;
      let currentShiftVal: string | undefined = undefined;
      let targetDateVal: string | undefined = undefined;
      let targetShiftVal: string | undefined = undefined;
      let repHostId: string | undefined = undefined;
      let repHostName: string | undefined = undefined;
      let compiledNotes = notes.trim();

      if (requestCategory === 'tukar_libur') {
        dateVal = liburDate;
        endDateVal = isLiburRange ? liburEndDate : undefined;
        targetDateVal = isLiburSwap ? liburSwapDate : undefined;
        if (isLiburSwap && liburSwapDate) {
          compiledNotes = `[Tukar Hari Libur] Libur: ${liburDate}${isLiburRange ? ` s.d. ${liburEndDate}` : ''} ditukar masuk kerja pada ${liburSwapDate}. ${compiledNotes}`;
        }
      } else if (requestCategory === 'tukar_shift') {
        dateVal = shiftCurrentDate;
        currentShiftVal = shiftCurrentSlot;
        targetDateVal = shiftTargetDate;
        targetShiftVal = shiftTargetSlot;
        if (replacementHostId) {
          const rep = allHosts.find((h) => h.id === replacementHostId);
          repHostId = rep?.id;
          repHostName = rep?.name;
        }
      } else {
        // Izin Tidak Masuk
        dateVal = izinDate;
        endDateVal = isIzinRange ? izinEndDate : undefined;
      }

      await hostRequestsApi.create({
        hostId: host.id,
        hostName: host.name,
        employeeId: host.employeeId,
        type: requestCategory,
        status: 'pending',
        date: dateVal,
        endDate: endDateVal,
        reasonCategory: categoryLabel,
        currentShift: currentShiftVal,
        targetDate: targetDateVal,
        targetShift: targetShiftVal,
        replacementHostId: repHostId,
        replacementHostName: repHostName,
        notes: compiledNotes,
        proofUrl: uploadedProofUrl,
      });

      setFeedback({
        type: 'success',
        message: `Pengajuan "${categoryLabel}" berhasil dikirimkan ke admin untuk ditinjau!`,
      });
      setNotes('');
      setProofFile(null);
      setProofPreview(null);
      loadHistory();
      if (onRequestSubmitted) onRequestSubmitted();

      // Switch to history tab after 1.2 seconds
      setTimeout(() => {
        setActiveTab('riwayat');
        setFeedback(null);
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Gagal mengirim pengajuan. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel pending request
  const handleCancelRequest = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan ini?')) return;
    try {
      await hostRequestsApi.delete(id);
      loadHistory();
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err: any) {
      alert(err?.message || 'Gagal membatalkan pengajuan.');
    }
  };

  // Filtered history
  const filteredHistory = requestsList.filter((r) => {
    if (historyFilter === 'all') return true;
    if (historyFilter === 'pending') return r.status === 'pending' || r.status === 'in_review';
    if (historyFilter === 'approved') return r.status === 'approved';
    if (historyFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

  const pendingCount = requestsList.filter((r) => r.status === 'pending' || r.status === 'in_review').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="relative p-5 pb-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-inner">
                <CalendarIcon className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Pengajuan Izin & Jadwal Host
                </h3>
                <p className="text-xs text-indigo-100/90 font-medium mt-0.5">
                  Host: <span className="font-bold text-white">{host?.name}</span>
                </p>
              </div>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 mt-4 bg-black/20 rounded-2xl backdrop-blur-md border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab('form'); setFeedback(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Buat Pengajuan</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('riwayat'); setFeedback(null); loadHistory(); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  activeTab === 'riwayat'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Riwayat Pengajuan</span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b shrink-0 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {/* ================= TAB 1: FORM PENGAJUAN ================= */}
            {activeTab === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Kategori / Jenis Pengajuan (3 Cards Requested by User) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Kategori / Alasan Izin
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {REQUEST_CATEGORIES.map((cat) => {
                      const isSelected = requestCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setRequestCategory(cat.id);
                            setFeedback(null);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/25 shadow-xs'
                              : 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{cat.emoji}</span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className={`text-xs font-black leading-tight block ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                              {cat.label}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5 block">
                              {cat.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ================= FORM MODE 1: REQ / TUKAR HARI LIBUR ================= */}
                {requestCategory === 'tukar_libur' && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">Tanggal Hari Libur yang Diminta</label>
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isLiburRange}
                            onChange={(e) => setIsLiburRange(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Libur lebih dari 1 hari?</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <input
                            type="date"
                            required
                            value={liburDate}
                            onChange={(e) => setLiburDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                          {isLiburRange && <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tanggal Mulai Libur</span>}
                        </div>

                        {isLiburRange && (
                          <div>
                            <input
                              type="date"
                              required={isLiburRange}
                              value={liburEndDate}
                              min={liburDate}
                              onChange={(e) => setLiburEndDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tanggal Selesai Libur</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tukar Hari Kerja Pengganti (Opsional) */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80">
                      <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={isLiburSwap}
                          onChange={(e) => setIsLiburSwap(e.target.checked)}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Tukar dengan Hari Kerja Lain (Tukar Off)?</span>
                      </label>

                      {isLiburSwap ? (
                        <div>
                          <span className="text-[11px] text-indigo-700 font-semibold mb-1 block">
                            Tanggal Masuk Kerja Pengganti:
                          </span>
                          <input
                            type="date"
                            required={isLiburSwap}
                            value={liburSwapDate}
                            onChange={(e) => setLiburSwapDate(e.target.value)}
                            className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                          <p className="text-[10px] text-indigo-600 mt-1">
                            Libur pada tanggal terpilih akan digantikan dengan masuk kerja pada tanggal ini.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Centang jika Anda ingin menukar jatah hari libur reguler Anda ke hari lain.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= FORM MODE 2: REQ / TUKAR SHIFT ================= */}
                {requestCategory === 'tukar_shift' && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    {/* Jadwal Asal */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>1. Jadwal & Shift Asal yang Mau Ditukar</span>
                        {hostSchedules.length > 0 && (
                          <span className="text-[11px] text-indigo-600 font-normal">Bisa pilih dari jadwal terdaftar</span>
                        )}
                      </label>

                      {hostSchedules.length > 0 ? (
                        <div className="mb-2">
                          <select
                            value={selectedScheduleId}
                            onChange={(e) => handleSelectSchedule(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          >
                            <option value="">-- Pilih dari Jadwal Terdaftar Saya --</option>
                            {hostSchedules
                              .filter((s) => s.date >= new Date().toISOString().split('T')[0])
                              .slice(0, 15)
                              .map((sched) => (
                                <option key={sched.id} value={sched.id}>
                                  {sched.date} • {sched.timeSlot || 'Shift'} • {sched.brand || 'Brand'} {sched.studio ? `(${sched.studio})` : ''}
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Tanggal Jadwal Asal</span>
                          <input
                            type="date"
                            required
                            value={shiftCurrentDate}
                            onChange={(e) => setShiftCurrentDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Shift Asal</span>
                          <select
                            value={shiftCurrentSlot}
                            onChange={(e) => setShiftCurrentSlot(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          >
                            {availableShifts.map((sh) => (
                              <option key={sh} value={sh}>{sh}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Jadwal Target yang Diminta */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                      <label className="block text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>2. Jadwal Baru / Shift yang Anda Minta</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <span className="text-[10px] text-indigo-700 font-semibold mb-1 block">Tanggal Pengganti / Dituju</span>
                          <input
                            type="date"
                            required
                            value={shiftTargetDate}
                            onChange={(e) => setShiftTargetDate(e.target.value)}
                            className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-700 font-semibold mb-1 block">Pilih Shift yang Diinginkan</span>
                          <select
                            value={shiftTargetSlot}
                            onChange={(e) => setShiftTargetSlot(e.target.value)}
                            className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          >
                            {availableShifts.map((sh) => (
                              <option key={sh} value={sh}>{sh}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Rekan Host Pengganti (Opsional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tukar Langsung dengan Rekan Host? (Opsional)
                      </label>
                      <p className="text-[11px] text-slate-400 mb-1.5">
                        Jika sudah bersepakat dengan rekan host lain untuk bertukar shift, pilih nama host tersebut.
                      </p>
                      <select
                        value={replacementHostId}
                        onChange={(e) => setReplacementHostId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="">-- Tidak ada (Hanya Request Ganti Shift ke Admin) --</option>
                        {allHosts
                          .filter((h) => h.id !== host.id)
                          .map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name} {h.employeeId ? `(${h.employeeId})` : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ================= FORM MODE 3: IZIN TIDAK MASUK ================= */}
                {requestCategory === 'izin' && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">Tanggal Izin Tidak Masuk</label>
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isIzinRange}
                            onChange={(e) => setIsIzinRange(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Izin lebih dari 1 hari?</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <input
                            type="date"
                            required
                            value={izinDate}
                            onChange={(e) => setIzinDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                          {isIzinRange && <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tanggal Mulai Izin</span>}
                        </div>

                        {isIzinRange && (
                          <div>
                            <input
                              type="date"
                              required={isIzinRange}
                              value={izinEndDate}
                              min={izinDate}
                              onChange={(e) => setIzinEndDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tanggal Selesai Izin</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Keterangan / Penjelasan (Semua Tipe) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Keterangan Tambahan / Penjelasan Alasan
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      requestCategory === 'tukar_libur'
                        ? 'Contoh: Ingin mengajukan libur untuk keperluan mendadak, atau tukar off day dengan hari rabu...'
                        : requestCategory === 'tukar_shift'
                        ? 'Contoh: Ada jadwal kuliah di pagi hari, mohon izin pindah ke shift siang/malam...'
                        : 'Contoh: Izin tidak masuk kerja dikarenakan sakit demam / urusan keluarga mendesak...'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Upload Bukti / Surat Dokter (Terutama untuk Izin & Hari Libur) */}
                {(requestCategory === 'izin' || requestCategory === 'tukar_libur') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lampiran Bukti / Surat Dokter (Opsional)
                    </label>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Sangat dianjurkan melampirkan foto surat sakit atau dokumen pendukung.
                    </p>

                    {proofPreview ? (
                      <div className="relative rounded-2xl border border-slate-200 p-2 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-3">
                          <img
                            src={proofPreview}
                            alt="Bukti Lampiran"
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Lampiran Foto Terpasang</p>
                            <p className="text-[11px] text-emerald-600 font-semibold">Siap dikirimkan bersama pengajuan</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setProofFile(null); setProofPreview(null); }}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Hapus foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 transition-all">
                        <Upload className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-700">Pilih atau Ambil Foto Dokumen</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG (Otomatis dikompres)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>
                      {loading
                        ? 'Mengirim Permohonan...'
                        : requestCategory === 'tukar_libur'
                        ? 'Kirim Req/Tukar Hari Libur'
                        : requestCategory === 'tukar_shift'
                        ? 'Kirim Req/Tukar Shift'
                        : 'Kirim Izin Tidak Masuk'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= TAB 2: RIWAYAT PENGAJUAN ================= */}
            {activeTab === 'riwayat' && (
              <div className="space-y-3">
                {/* Filter status */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'pending', label: 'Menunggu / Ditinjau' },
                    { id: 'approved', label: 'Diterima' },
                    { id: 'rejected', label: 'Ditolak' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setHistoryFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        historyFilter === f.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {loadingHistory ? (
                  <div className="text-center py-10">
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">Memuat riwayat pengajuan...</p>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                    <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Belum Ada Pengajuan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pengajuan izin, hari libur, atau tukar shift Anda akan muncul di sini beserta status tanggapan admin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredHistory.map((req) => {
                      const isTukarLibur = req.type === 'tukar_libur' || req.reasonCategory?.includes('Hari Libur');
                      const isTukarShift = req.type === 'tukar_shift' || req.type === 'tukar_jadwal' || req.reasonCategory?.includes('Shift');
                      const isPending = req.status === 'pending';
                      const isInReview = req.status === 'in_review';
                      const isApproved = req.status === 'approved';
                      const isRejected = req.status === 'rejected';

                      const typeBadge = isTukarLibur ? (
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                          🏖️ Req/Tukar Hari Libur
                        </span>
                      ) : isTukarShift ? (
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                          🔄 Req/Tukar Shift
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                          📋 Izin Tidak Masuk
                        </span>
                      );

                      return (
                        <div
                          key={req.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {typeBadge}
                              {req.reasonCategory && req.reasonCategory !== 'Req/Tukar Hari Libur' && req.reasonCategory !== 'Req/Tukar Shift' && req.reasonCategory !== 'Izin Tidak Masuk' && (
                                <span className="text-xs font-bold text-slate-700">
                                  {req.reasonCategory}
                                </span>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" /> Menunggu Tinjauan
                                </span>
                              )}
                              {isInReview && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Sparkles className="w-3 h-3 text-indigo-600" /> Sedang Ditinjau
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Diterima
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                  <X className="w-3 h-3 text-rose-600" /> Ditolak
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detail Konten */}
                          <div className="text-xs text-slate-700 space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            {isTukarLibur ? (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                  Tanggal Hari Libur:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {req.date} {req.endDate ? ` s.d. ${req.endDate}` : ''}
                                </span>
                                {req.targetDate && (
                                  <p className="text-[11px] text-teal-700 font-semibold mt-1">
                                    🔄 Ditukar masuk kerja pada: {req.targetDate}
                                  </p>
                                )}
                              </div>
                            ) : isTukarShift ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                    Jadwal Asal:
                                  </span>
                                  <span className="font-semibold text-slate-800">
                                    {req.date} ({req.currentShift || '-'})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                    Diminta Menjadi:
                                  </span>
                                  <span className="font-semibold text-indigo-600">
                                    {req.targetDate || req.date} ({req.targetShift || '-'})
                                  </span>
                                  {req.replacementHostName && (
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                      Tukar dengan: <span className="font-bold text-slate-700">{req.replacementHostName}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                  Tanggal Izin:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {req.date} {req.endDate ? ` s.d. ${req.endDate}` : ''}
                                </span>
                              </div>
                            )}

                            {req.notes && (
                              <div className="pt-1.5 border-t border-slate-200/60 mt-1.5">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                  Alasan / Penjelasan:
                                </span>
                                <p className="text-slate-800 font-medium italic mt-0.5">"{req.notes}"</p>
                              </div>
                            )}

                            {req.proofUrl && (
                              <div className="pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalImg(req.proofUrl || null)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Lihat Lampiran Foto
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Admin Feedback Notes */}
                          {req.adminNotes && (
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900">
                              <span className="font-bold block text-[10px] uppercase text-amber-800 mb-0.5">
                                Catatan Admin ({req.reviewedBy || 'Admin'}):
                              </span>
                              <p className="font-medium italic">"{req.adminNotes}"</p>
                            </div>
                          )}

                          {/* Action footer */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Diajukan: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleCancelRequest(req.id)}
                                className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                              >
                                Batalkan Pengajuan
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] p-2 bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full z-10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewModalImg}
              alt="Bukti Lampiran Full"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
