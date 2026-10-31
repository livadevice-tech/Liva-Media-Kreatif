import React, { useState, useEffect } from 'react';
import {
  X, Calendar as CalendarIcon, Clock, ArrowLeftRight, CheckCircle2,
  AlertCircle, Upload, Trash2, Send, FileText, ChevronRight,
  Sparkles, RefreshCw, Eye
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

const REASON_CATEGORIES = [
  { id: 'Sakit', label: 'Sakit / Kesehatan', emoji: '🤒', desc: 'Sakit demam, flu, atau butuh istirahat' },
  { id: 'Cuti / Istirahat', label: 'Cuti / Libur', emoji: '🏖️', desc: 'Permohonan jatah libur / cuti tahunan' },
  { id: 'Keperluan Keluarga', label: 'Keperluan Keluarga', emoji: '👨‍👩‍👧', desc: 'Acara keluarga, hajatan, atau mendampingi keluarga' },
  { id: 'Pendidikan / Ujian', label: 'Pendidikan / Ujian', emoji: '🎓', desc: 'Jadwal kuliah, skripsi, atau ujian sekolah' },
  { id: 'Keadaan Darurat', label: 'Mendesak / Darurat', emoji: '🚨', desc: 'Musibah, kecelakaan, atau kendala tak terduga' },
  { id: 'Lainnya', label: 'Lainnya', emoji: '📝', desc: 'Keperluan lain yang belum tercantum' },
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
  const [activeTab, setActiveTab] = useState<'izin' | 'tukar' | 'riwayat'>('izin');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State: Izin
  const [izinDate, setIzinDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isRange, setIsRange] = useState(false);
  const [izinEndDate, setIzinEndDate] = useState('');
  const [reasonCategory, setReasonCategory] = useState(REASON_CATEGORIES[0].id);
  const [izinNotes, setIzinNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Form State: Tukar Jadwal
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [currentShift, setCurrentShift] = useState(availableShifts[0] || '');
  const [targetDate, setTargetDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [targetShift, setTargetShift] = useState(availableShifts[1] || availableShifts[0] || '');
  const [replacementHostId, setReplacementHostId] = useState('');
  const [tukarNotes, setTukarNotes] = useState('');

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

  // When host selects an existing schedule to swap
  const handleSelectSchedule = (schedId: string) => {
    setSelectedScheduleId(schedId);
    const found = hostSchedules.find((s) => s.id === schedId);
    if (found) {
      setCurrentDate(found.date);
      setCurrentShift(found.timeSlot || '');
    }
  };

  // Proof file upload handler
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

  // Submit Ajukan Izin
  const handleSubmitIzin = async (e: React.FormEvent) => {
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

      await hostRequestsApi.create({
        hostId: host.id,
        hostName: host.name,
        employeeId: host.employeeId,
        type: 'izin',
        status: 'pending',
        date: izinDate,
        endDate: isRange ? izinEndDate : undefined,
        reasonCategory,
        notes: izinNotes,
        proofUrl: uploadedProofUrl,
      });

      setFeedback({ type: 'success', message: 'Pengajuan izin berhasil dikirimkan ke admin untuk ditinjau!' });
      setIzinNotes('');
      setProofFile(null);
      setProofPreview(null);
      loadHistory();
      if (onRequestSubmitted) onRequestSubmitted();

      // Switch to history tab after 1.5 seconds
      setTimeout(() => {
        setActiveTab('riwayat');
        setFeedback(null);
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mengirim pengajuan izin. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  // Submit Tukar Jadwal
  const handleSubmitTukar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const repHost = allHosts.find((h) => h.id === replacementHostId);

      await hostRequestsApi.create({
        hostId: host.id,
        hostName: host.name,
        employeeId: host.employeeId,
        type: 'tukar_jadwal',
        status: 'pending',
        date: currentDate,
        currentShift,
        targetDate,
        targetShift,
        replacementHostId: replacementHostId || undefined,
        replacementHostName: repHost?.name || undefined,
        notes: tukarNotes,
      });

      setFeedback({ type: 'success', message: 'Permohonan tukar jadwal berhasil dikirimkan ke admin untuk ditinjau!' });
      setTukarNotes('');
      loadHistory();
      if (onRequestSubmitted) onRequestSubmitted();

      setTimeout(() => {
        setActiveTab('riwayat');
        setFeedback(null);
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mengirim permohonan tukar jadwal. Silakan coba lagi.' });
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
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
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
                  Pengajuan Izin & Tukar Jadwal
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
                onClick={() => { setActiveTab('izin'); setFeedback(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'izin'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ajukan Izin</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('tukar'); setFeedback(null); }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'tukar'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Tukar Jadwal</span>
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
                <span>Riwayat</span>
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
            {/* ================= TAB 1: AJUKAN IZIN ================= */}
            {activeTab === 'izin' && (
              <form onSubmit={handleSubmitIzin} className="space-y-4">
                {/* Tanggal Izin */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Tanggal Izin</label>
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRange}
                        onChange={(e) => setIsRange(e.target.checked)}
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
                      {isRange && <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tanggal Mulai</span>}
                    </div>

                    {isRange && (
                      <div>
                        <input
                          type="date"
                          required={isRange}
                          value={izinEndDate}
                          min={izinDate}
                          onChange={(e) => setIzinEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Tanggal Selesai</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kategori Izin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kategori / Alasan Izin
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REASON_CATEGORIES.map((cat) => {
                      const isSelected = reasonCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setReasonCategory(cat.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-lg mb-1">{cat.emoji}</span>
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Keterangan / Penjelasan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Keterangan Tambahan / Penjelasan
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={izinNotes}
                    onChange={(e) => setIzinNotes(e.target.value)}
                    placeholder="Tuliskan alasan izin Anda secara jelas..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Upload Bukti / Surat Dokter (Opsional) */}
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
                          <span className="text-[10px] text-emerald-600 font-semibold">Siap diupload bersama permohonan</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreview(null);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Lampiran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer">
                      <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                      <span className="text-xs font-bold text-slate-700">Pilih Foto atau Dokumen</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG atau WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProofChange}
                      />
                    </label>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loading ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Izin'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= TAB 2: TUKAR JADWAL ================= */}
            {activeTab === 'tukar' && (
              <form onSubmit={handleSubmitTukar} className="space-y-4">
                {/* Jadwal Saya Yang Ingin Ditukar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    1. Pilih Jadwal Anda yang Mau Ditukar
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
                      <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Tanggal Jadwal Saat Ini</span>
                      <input
                        type="date"
                        required
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold mb-1 block">Shift Saat Ini</span>
                      <select
                        value={currentShift}
                        onChange={(e) => setCurrentShift(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {availableShifts.map((sh) => (
                          <option key={sh} value={sh}>{sh}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Target Jadwal Baru Yang Diminta */}
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
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-700 font-semibold mb-1 block">Pilih Shift yang Diinginkan</span>
                      <select
                        value={targetShift}
                        onChange={(e) => setTargetShift(e.target.value)}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      >
                        {availableShifts.map((sh) => (
                          <option key={sh} value={sh}>{sh}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tukar Dengan Host Lain? */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tukar Langsung dengan Rekan Host? (Opsional)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    Jika Anda sudah sepakat dengan host lain untuk bertukar shift, pilih nama host tersebut.
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

                {/* Alasan Tukar Jadwal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alasan Tukar Jadwal / Shift
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={tukarNotes}
                    onChange={(e) => setTukarNotes(e.target.value)}
                    placeholder="Contoh: Ada kuliah di pagi hari, ingin tukar ke shift malam atau tukar dengan si X..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loading ? 'Mengirim Permohonan...' : 'Kirim Permohonan Tukar Jadwal'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ================= TAB 3: RIWAYAT PENGAJUAN ================= */}
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
                      Pengajuan izin atau tukar jadwal yang Anda kirim akan muncul di sini beserta status tanggapan admin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredHistory.map((req) => {
                      const isIzin = req.type === 'izin';
                      const isPending = req.status === 'pending';
                      const isInReview = req.status === 'in_review';
                      const isApproved = req.status === 'approved';
                      const isRejected = req.status === 'rejected';

                      return (
                        <div
                          key={req.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                  isIzin
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {isIzin ? 'Izin / Cuti' : 'Tukar Jadwal'}
                              </span>

                              {req.reasonCategory && (
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
                            {isIzin ? (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                  Tanggal Izin:
                                </span>
                                <span className="font-bold text-slate-800">
                                  {req.date} {req.endDate ? ` s.d. ${req.endDate}` : ''}
                                </span>
                              </div>
                            ) : (
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
                                  <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wide">
                                    Request Shift Dituju:
                                  </span>
                                  <span className="font-bold text-indigo-900">
                                    {req.targetDate || req.date} ({req.targetShift || '-'})
                                  </span>
                                </div>
                                {req.replacementHostName && (
                                  <div className="sm:col-span-2">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                      Tukar dengan Host:
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      {req.replacementHostName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {req.notes && (
                              <div className="pt-1 border-t border-slate-200/50 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                                  Alasan:
                                </span>
                                <p className="text-xs text-slate-600 leading-snug">{req.notes}</p>
                              </div>
                            )}

                            {req.proofUrl && (
                              <div className="pt-1">
                                <a
                                  href={req.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Lihat Lampiran Bukti
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Admin response / Catatan Admin */}
                          {req.adminNotes && (
                            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
                              <span className="font-bold text-[10px] uppercase tracking-wide text-amber-700 block">
                                Tanggapan Admin:
                              </span>
                              <p className="mt-0.5 leading-snug font-medium italic">"{req.adminNotes}"</p>
                              {req.reviewedBy && (
                                <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                                  Ditinjau oleh: {req.reviewedBy}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer Actions */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>
                              Diajukan: {req.createdAt ? new Date(req.createdAt).toLocaleString('id-ID') : '-'}
                            </span>

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleCancelRequest(req.id)}
                                className="text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer"
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
    </AnimatePresence>
  );
}
