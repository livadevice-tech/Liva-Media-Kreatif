import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ContentDraftItem, Brand, ContentPlatform, ContentType } from '../../types/app';

interface ScheduleToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: ContentDraftItem | null;
  brands: Brand[];
  onSchedule: (id: string, payload: {
    scheduled_at: string;
    brand_id?: string;
    platform?: string;
    content_type?: string;
  }) => Promise<void>;
  onSuccessNavigateToCalendar?: () => void;
}

export const ScheduleToCalendarModal: React.FC<ScheduleToCalendarModalProps> = ({
  isOpen,
  onClose,
  draft,
  brands,
  onSchedule,
  onSuccessNavigateToCalendar,
}) => {
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [scheduleTime, setScheduleTime] = useState('11:00');
  const [selectedBrandId, setSelectedBrandId] = useState(draft?.brand_id || '');
  const [selectedPlatform, setSelectedPlatform] = useState(draft?.platform || 'instagram');
  const [selectedContentType, setSelectedContentType] = useState(draft?.content_type || 'reels');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  React.useEffect(() => {
    if (draft) {
      setSelectedBrandId(draft.brand_id || brands[0]?.id || '');
      setSelectedPlatform(draft.platform || 'instagram');
      setSelectedContentType(draft.content_type || 'reels');
      setScheduledSuccess(false);
      setErrorMsg('');
    }
  }, [draft, brands, isOpen]);

  if (!isOpen || !draft) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) {
      setErrorMsg('Silakan pilih tanggal posting.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const scheduled_at = `${scheduleDate} ${scheduleTime || '11:00'}:00`;
      await onSchedule(draft.id, {
        scheduled_at,
        brand_id: selectedBrandId || draft.brand_id,
        platform: selectedPlatform,
        content_type: selectedContentType,
      });
      setScheduledSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menjadwalkan ide ke kalender.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Jadwalkan ke Calender Content
              </h3>
              <p className="text-[11px] text-slate-400">
                Ubah draft ide menjadi postingan terjadwal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {scheduledSuccess ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                Berhasil Dijadwalkan!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Ide konten <strong>"{draft.title}"</strong> kini telah resmi masuk ke dalam Calender Content pada tanggal {scheduleDate} pukul {scheduleTime}.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
              {onSuccessNavigateToCalendar && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuccessNavigateToCalendar();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Buka Kalender</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Scheduling Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Target Draft Summary Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ide yang Akan Dijadwalkan:
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-2">
                {draft.title}
              </div>
              {draft.hook && (
                <div className="text-[11px] text-slate-500 italic line-clamp-1">
                  "{draft.hook}"
                </div>
              )}
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tanggal Posting</span>
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jam Posting</span>
                </label>
                <input
                  type="time"
                  required
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Platform & Brand Target */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Brand / Klien</label>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
                >
                  <option value="">-- Pilih Brand --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as ContentPlatform)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 capitalize"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Menjadwalkan...' : 'Konfirmasi Masukkan ke Kalender'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
