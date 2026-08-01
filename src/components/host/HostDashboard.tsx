import React, { useState } from 'react';
import { 
  Bell, MapPin, User, FileText, Calendar as CalendarIcon,
  CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type HostDashboardProps = {
  activeHostObj: any;
  hostForm: any;
  setHostForm: React.Dispatch<React.SetStateAction<any>>;
  handleHostAttendanceSubmit: (e: React.FormEvent) => void;
  hostFormError: string;
  setHostFormError: React.Dispatch<React.SetStateAction<string>>;
  showFormSuccess: boolean;
  submittedMessage: string;
  showLateAlert: boolean;
  setShowLateAlert: React.Dispatch<React.SetStateAction<boolean>>;
  lateCheckInDetails: any;
  handleLogout: () => void;
  brands: any[];
  clientBrands: any[];
  platforms: string[];
  shifts: string[];
  studios: any[];
  hostLogs: any[];
  hostCalendarMonth: number;
  hostCalendarYear: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  renderCalendarDays: () => React.ReactNode;
};

export default function HostDashboard({
  activeHostObj,
  hostForm,
  setHostForm,
  handleHostAttendanceSubmit,
  hostFormError,
  setHostFormError,
  showFormSuccess,
  submittedMessage,
  showLateAlert,
  setShowLateAlert,
  lateCheckInDetails,
  handleLogout,
  brands,
  clientBrands,
  platforms,
  shifts,
  studios,
  hostLogs,
  hostCalendarMonth,
  hostCalendarYear,
  handlePrevMonth,
  handleNextMonth,
  renderCalendarDays,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'absen' | 'rekap' | 'kalender'>('absen');

  const initials = activeHostObj?.name 
    ? activeHostObj.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'NA';

  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen bg-[#f8f9fc] p-4 font-sans text-slate-800">
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm mb-4 relative">
        {/* Right action buttons */}
        <div className="absolute top-5 right-5 flex flex-col items-end gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors">
            <Bell size={20} />
          </button>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 text-[10px] font-black tracking-wider uppercase hover:bg-red-50 transition-colors">
            LOG OUT
          </button>
          <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            AKTIF
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl font-black">
            {initials}
          </div>
          <div className="flex-1 pt-1">
            <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-[9px] font-black tracking-widest uppercase rounded-full mb-2">
              HOST CONNECT
            </span>
            <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">
              {activeHostObj?.name || 'Nabila Zahratun Sita'}
            </h2>
            <div className="text-xs text-slate-500 font-semibold mb-0.5">
              ID: {activeHostObj?.employeeId || ''}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <MapPin size={14} className="text-purple-600" />
              {activeHostObj?.studio || 'Tanggamus'}
            </div>
          </div>
        </div>

        {/* Panduan Singkat Box */}
        <div className="mt-6 bg-[#f8f9fa] rounded-2xl border border-slate-200 p-4">
          <h3 className="text-[11px] font-black tracking-widest text-slate-500 mb-2 uppercase">Panduan Singkat</h3>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-4">
            Pilih tab, isi form absen, lalu kirim. Riwayat dan kalender membantu kamu cek jadwal tanpa harus tanya admin.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">1. Absen masuk</span>
            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">2. Cek rekap</span>
            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">3. Lihat kalender</span>
          </div>
        </div>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="bg-[#f0f2f5] p-1.5 rounded-[20px] flex gap-1 mb-4 border border-slate-200">
        <button 
          onClick={() => setActiveTab('absen')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === 'absen' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <User size={16} /> Absen
        </button>
        <button 
          onClick={() => setActiveTab('rekap')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === 'rekap' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <FileText size={16} /> Rekap
        </button>
        <button 
          onClick={() => setActiveTab('kalender')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === 'kalender' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <CalendarIcon size={16} /> Kalender
        </button>
      </div>

      {/* --- TAB CONTENT: ABSEN --- */}
      {activeTab === 'absen' && (
        <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm animate-fadeIn">
          <div className="mb-6">
            <h3 className="text-[11px] font-black tracking-widest text-slate-500 mb-2 uppercase">Form Absensi Hari Ini</h3>
            <p className="text-[13px] font-bold text-slate-700 leading-relaxed">
              Isi data di bawah sesuai jadwal yang sedang kamu jalani. Kalau ada yang belum terisi, pilih dulu sebelum submit.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Brand</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.brand || 'Pilih brand'}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Platform</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.platform || 'Pilih platform'}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Shift</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.shift || 'Pilih shift'}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Studio</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.studio || 'Pilih studio'}</span>
            </div>
          </div>

          <AnimatePresence>
            {showLateAlert && lateCheckInDetails && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-100 flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="font-bold">Late check-in (+{lateCheckInDetails.diffMinutes}m)</span>. Waktu: {lateCheckInDetails.time}.
                </div>
                <button type="button" onClick={() => setShowLateAlert(false)} className="ml-auto"><X className="w-3 h-3" /></button>
              </motion.div>
            )}
            {showFormSuccess && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800 border border-emerald-100 flex gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">{submittedMessage}</span>
              </motion.div>
            )}
            {hostFormError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-red-50 rounded-xl p-3 text-xs text-red-800 border border-red-100 font-bold">
                {hostFormError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleHostAttendanceSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Brand Besutan:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <select value={hostForm.brand} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, brand: e.target.value })); }} required className="w-full bg-white border border-slate-200 text-slate-500 font-bold rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all appearance-none cursor-pointer">
                <option value="" disabled>-- Pilih Brand Besutan --</option>
                {Array.from(new Set([hostForm.brand, ...(clientBrands?.length > 0 ? clientBrands.map((cb) => cb.name) : brands)].map(b => b?.trim()).filter(Boolean))).map(b => (
                  <option key={b} value={b} className="text-slate-800">{b}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Platform Streaming:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <select value={hostForm.platform} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, platform: e.target.value })); }} required className="w-full bg-white border border-slate-200 text-slate-500 font-bold rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all appearance-none cursor-pointer">
                <option value="" disabled>-- Pilih Platform Streaming --</option>
                {platforms.map(p => <option key={p} value={p} className="text-slate-800">{p}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Shift Kerja Live:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <select value={hostForm.shift} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, shift: e.target.value })); }} required className="w-full bg-white border border-slate-200 text-slate-500 font-bold rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all appearance-none cursor-pointer">
                <option value="" disabled>-- Pilih Shift Kerja --</option>
                {shifts.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Studio Penempatan:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <select value={hostForm.studio} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, studio: e.target.value })); }} required className="w-full bg-white border border-slate-200 text-slate-500 font-bold rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all appearance-none cursor-pointer">
                <option value="" disabled>-- Pilih Studio Penempatan --</option>
                {studios.map(st => <option key={st.id} value={st.name} className="text-slate-800">{st.name} - {st.location}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full bg-purple-700 text-white rounded-xl py-3.5 text-xs font-black tracking-wider uppercase mt-4 hover:bg-purple-800 transition-colors shadow-md">
              Submit Absen Sekarang
            </button>
          </form>
        </div>
      )}

      {/* --- TAB CONTENT: REKAP (Timeline) --- */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm animate-fadeIn">
          <h3 className="text-[11px] font-black tracking-widest text-slate-500 mb-4 uppercase">Rekap Hari Ini</h3>
          {hostLogs.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400">Belum ada absen hari ini.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {hostLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-slate-900">{log.brandHandled}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">{log.shiftHours}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">{log.platform} • {log.studio}</div>
                  <div className="text-[10px] font-bold text-slate-400">Tercatat: {log.checkInTime}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: KALENDER --- */}
      {activeTab === 'kalender' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-purple-50 rounded-[20px] p-4 border border-purple-100">
            <h3 className="text-xs font-black tracking-wider text-purple-900 mb-1 uppercase">Jadwal Siaran & Libur</h3>
            <p className="text-[11px] font-bold text-purple-700">Berikut ini jadwal penempatan studio, brand, dan status kerja Anda.</p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-purple-950">
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][hostCalendarMonth]} {hostCalendarYear}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors">&lt;</button>
                <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase">Bulan Ini</div>
                <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors">&gt;</button>
              </div>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-purple-500 mb-4 uppercase tracking-widest">
                <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
              </div>
              <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center text-sm font-bold text-slate-500">
                {/* Wrap the render function to add styling if it's returning bare buttons, but since the component is passed in, it relies on App.tsx's logic */}
                {renderCalendarDays()}
              </div>
            </div>

            <div className="mt-6 bg-[#f8f9fa] rounded-xl p-4">
              <h3 className="text-[10px] font-black text-purple-900 mb-3">Keterangan Warna Shift Brand:</h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-blue-300 bg-blue-100"></div>
                  Madu Uray
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-emerald-300 bg-emerald-100"></div>
                  RHC
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
