import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ContentPost, Brand, ContentStatus } from '../../types/app';

interface ScheduleToCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ContentPost | null;
  brands: Brand[];
  onSchedule: (post: Partial<ContentPost>) => Promise<void>;
  onSuccessNavigateToCalendar?: () => void;
}

export const ScheduleToCalendarModal: React.FC<ScheduleToCalendarModalProps> = ({
  isOpen,
  onClose,
  post,
  brands,
  onSchedule,
  onSuccessNavigateToCalendar,
}) => {
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [scheduleTime, setScheduleTime] = useState('11:00');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  useEffect(() => {
    if (post) {
      if (post.scheduled_at) {
        try {
          const parts = post.scheduled_at.replace('T', ' ').split(' ');
          setScheduleDate(parts[0] || new Date().toISOString().slice(0, 10));
          if (parts[1]) {
            setScheduleTime(parts[1].slice(0, 5));
          }
        } catch {
          setScheduleDate(new Date().toISOString().slice(0, 10));
        }
      } else {
        setScheduleDate(new Date().toISOString().slice(0, 10));
        setScheduleTime('11:00');
      }
      setScheduledSuccess(false);
      setErrorMsg('');
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate) {
      setErrorMsg('Silakan tentukan tanggal tayang.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const scheduled_at = `${scheduleDate} ${scheduleTime || '11:00'}:00`;
      await onSchedule({
        ...post,
        scheduled_at,
        status: 'scheduled' as ContentStatus,
      });
      setScheduledSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menjadwalkan konten ke kalender.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Jadwalkan ke Kalender Konten
              </h3>
              <p className="text-[11px] text-slate-500">
                Ubah status ke "Terjadwal" dan tentukan waktu tayang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {scheduledSuccess ? (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">
                Konten Berhasil Dijadwalkan!
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Konten <strong>"{post.title}"</strong> kini telah resmi dijadwalkan pada {scheduleDate} pukul {scheduleTime} dan masuk ke Kalender Konten.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {onSuccessNavigateToCalendar && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuccessNavigateToCalendar();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Buka di Calender Content</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Target Post Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Draft Konten yang Dijadwalkan:
              </div>
              <div className="font-bold text-xs text-slate-900 line-clamp-2">
                {post.title}
              </div>
              {post.hook && (
                <div className="text-[11px] text-amber-800 italic line-clamp-1 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/50 mt-1">
                  "{post.hook}"
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Tayang di Kalender <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              />
            </div>

            {/* Time Picker */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Jam Tayang (WIB)</span>
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-1">⏳</span>
                    <span>Menjadwalkan...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Konfirmasi & Masukkan ke Kalender</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
