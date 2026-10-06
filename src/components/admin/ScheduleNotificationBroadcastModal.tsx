import React, { useState, useMemo } from 'react';
import { 
  X, 
  Bell, 
  Send, 
  Smartphone, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Search, 
  Volume2, 
  Inbox, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { ShiftSchedule, HostEmployee } from '../../types';

interface ScheduleNotificationBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStartDate: Date;
  computedSchedules: ShiftSchedule[];
  hosts: HostEmployee[];
  onSendNotification: (payload: {
    hostIds: string[];
    title: string;
    message: string;
    dateRangeStr: string;
    sendWebPush: boolean;
    sendInApp: boolean;
    playSound: boolean;
  }) => Promise<{ count: number }>;
}

const TEMPLATES = [
  {
    id: 'new_roster',
    label: '🚀 Roster Baru',
    title: '📅 Jadwal Siaran Mingguan Baru Telah Terbit!',
    body: 'Halo {host_name}, jadwal siaran kamu untuk periode {periode} telah resmi dirilis ({total_sesi} sesi). Silakan periksa shift dan studio kamu di aplikasi Liva!',
  },
  {
    id: 'update_roster',
    label: '🔄 Revisi Jadwal',
    title: '🔄 Perubahan Jadwal Siaran Diperbarui',
    body: 'Perhatian {host_name}, terdapat revisi pada jadwal siaran kamu untuk periode {periode}. Mohon buka aplikasi Liva untuk memeriksa jadwal terbaru ({total_sesi} sesi).',
  },
  {
    id: 'reminder',
    label: '⏰ Pengingat Sesi',
    title: '⏰ Pengingat Jadwal Siaran Minggu Ini',
    body: 'Halo {host_name}, kamu memiliki {total_sesi} sesi siaran terjadwal pada periode {periode}. Pastikan hadir dan absen tepat waktu ya!',
  },
];

export function ScheduleNotificationBroadcastModal({
  isOpen,
  onClose,
  weekStartDate,
  computedSchedules,
  hosts,
  onSendNotification,
}: ScheduleNotificationBroadcastModalProps) {
  // Format week range label
  const { dateRangeStr, startIso, endIso } = useMemo(() => {
    const start = new Date(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 6);

    const startIso = start.toISOString().split('T')[0];
    const endIso = end.toISOString().split('T')[0];

    const startStr = start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const dateRangeStr = `${startStr} - ${endStr}`;

    return { dateRangeStr, startIso, endIso };
  }, [weekStartDate]);

  // Analyze schedules in this week to find which hosts have schedules
  const hostsWithScheduleStats = useMemo(() => {
    const schedulesInWeek = computedSchedules.filter((s) => {
      const sDate = (s.date || '').split('T')[0];
      return sDate >= startIso && sDate <= endIso;
    });

    const statsMap = new Map<string, { count: number; brands: Set<string>; days: Set<string> }>();

    schedulesInWeek.forEach((s) => {
      if (!s.hostId) return;
      if (!statsMap.has(s.hostId)) {
        statsMap.set(s.hostId, { count: 0, brands: new Set(), days: new Set() });
      }
      const st = statsMap.get(s.hostId)!;
      st.count += 1;
      if (s.brand) st.brands.add(s.brand);
      if (s.date) {
        const d = new Date(s.date);
        st.days.add(d.toLocaleDateString('id-ID', { weekday: 'short' }));
      }
    });

    return hosts.map((h) => {
      const stat = statsMap.get(h.id);
      return {
        host: h,
        sessionCount: stat ? stat.count : 0,
        brands: stat ? Array.from(stat.brands) : [],
        days: stat ? Array.from(stat.days) : [],
        hasSchedule: (stat ? stat.count : 0) > 0,
      };
    });
  }, [computedSchedules, hosts, startIso, endIso]);

  // Scope: 'active_week' (only hosts with shifts in this week) or 'all_hosts'
  const [filterScope, setFilterScope] = useState<'active_week' | 'all_hosts'>('active_week');
  const [hostSearch, setHostSearch] = useState('');

  // Selected host IDs
  const [selectedHostIds, setSelectedHostIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    hostsWithScheduleStats.forEach((h) => {
      if (h.hasSchedule) initial.add(h.host.id);
    });
    // Fallback if none in week yet, select all
    if (initial.size === 0) {
      hosts.forEach((h) => initial.add(h.id));
    }
    return initial;
  });

  // Notification content state
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [body, setBody] = useState(TEMPLATES[0].body);

  // Delivery options
  const [sendWebPush, setSendWebPush] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [playSound, setPlaySound] = useState(true);

  // Submission state
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessResult, setSendSuccessResult] = useState<{ count: number } | null>(null);

  // Filtered hosts to display in list
  const displayedHosts = useMemo(() => {
    return hostsWithScheduleStats.filter((item) => {
      if (filterScope === 'active_week' && !item.hasSchedule) return false;
      if (hostSearch.trim()) {
        const q = hostSearch.toLowerCase();
        const matchName = item.host.name.toLowerCase().includes(q);
        const matchStudio = (item.host.studio || '').toLowerCase().includes(q);
        return matchName || matchStudio;
      }
      return true;
    });
  }, [hostsWithScheduleStats, filterScope, hostSearch]);

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setBody(tpl.body);
  };

  const handleToggleSelectAll = () => {
    const displayedIds = displayedHosts.map((h) => h.host.id);
    const allSelected = displayedIds.every((id) => selectedHostIds.has(id));

    setSelectedHostIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        displayedIds.forEach((id) => next.delete(id));
      } else {
        displayedIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleToggleHost = (id: string) => {
    setSelectedHostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleInsertTag = (tag: string) => {
    setBody((prev) => `${prev} ${tag}`);
  };

  // Sample preview rendering
  const sampleHostItem = useMemo(() => {
    const firstSelected = hostsWithScheduleStats.find((h) => selectedHostIds.has(h.host.id));
    return firstSelected || hostsWithScheduleStats[0] || {
      host: { id: 'sample', name: 'Jennita Yuliana' },
      sessionCount: 6,
      brands: ['Sumber Ayu', 'Safi'],
      days: ['Sen', 'Sel', 'Rab', 'Jum'],
      hasSchedule: true,
    };
  }, [hostsWithScheduleStats, selectedHostIds]);

  const previewBody = useMemo(() => {
    return body
      .replace(/{host_name}/g, sampleHostItem.host.name)
      .replace(/{periode}/g, dateRangeStr)
      .replace(/{total_sesi}/g, String(sampleHostItem.sessionCount || 1))
      .replace(/{brand_list}/g, sampleHostItem.brands.join(', ') || 'Semua Brand');
  }, [body, sampleHostItem, dateRangeStr]);

  const handleSend = async () => {
    if (selectedHostIds.size === 0) {
      alert('Pilih minimal 1 host untuk menerima notifikasi.');
      return;
    }
    if (!title.trim() || !body.trim()) {
      alert('Judul dan pesan notifikasi tidak boleh kosong.');
      return;
    }

    setIsSending(true);
    try {
      const res = await onSendNotification({
        hostIds: Array.from(selectedHostIds),
        title: title.trim(),
        message: body.trim(),
        dateRangeStr,
        sendWebPush,
        sendInApp,
        playSound,
      });
      setSendSuccessResult(res);
      setTimeout(() => {
        setSendSuccessResult(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim notifikasi: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-zoomIn">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Push Notifikasi Jadwal (PWA)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Periode: {dateRangeStr}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Kirim broadcast notifikasi jadwal langsung ke PWA dan akun masing-masing host
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {sendSuccessResult ? (
          <div className="p-12 text-center flex flex-col items-center justify-center my-auto animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-800 mb-1">
              Notifikasi Berhasil Dikirim!
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mb-2">
              Broadcast jadwal berhasil dikirimkan ke <strong className="text-slate-700">{sendSuccessResult.count} akun host</strong> melalui PWA Web Push dan Kotak Masuk.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col lg:flex-row gap-6">
            
            {/* LEFT COLUMN: Message Editor & Template */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  1. Pilih Template Cepat
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <span>{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Judul Notifikasi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Siaran Mingguan Baru..."
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-3xs"
                />
              </div>

              {/* Message Body Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Isi Pesan Notifikasi
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Dapat disesuaikan bebas
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Ketik isi pesan notifikasi..."
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none shadow-3xs leading-relaxed font-medium"
                />

                {/* Variable Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sisipkan Tag:
                  </span>
                  {[
                    { tag: '{host_name}', label: 'Nama Host' },
                    { tag: '{periode}', label: 'Periode' },
                    { tag: '{total_sesi}', label: 'Total Sesi' },
                    { tag: '{brand_list}', label: 'Brand' },
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 transition-colors cursor-pointer"
                      title={`Sisipkan ${item.tag}`}
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live PWA Mockup Preview */}
              <div className="mt-1 p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-md">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Smartphone className="w-3.5 h-3.5" /> Pratinjau Tampilan Notifikasi PWA
                  </span>
                  <span className="text-slate-500 font-mono">Sample: {sampleHostItem.host.name}</span>
                </div>

                <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                    L
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-slate-200 truncate">
                        LIVA MEDIA KREATIF
                      </span>
                      <span className="text-[9px] text-slate-400 shrink-0">Baru saja</span>
                    </div>
                    <h5 className="text-xs font-bold text-amber-300 mt-0.5 truncate">
                      {title || 'Judul Notifikasi'}
                    </h5>
                    <p className="text-[11px] text-slate-300 leading-snug mt-1 font-normal line-clamp-3">
                      {previewBody}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Channels Checklist */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendWebPush}
                    onChange={(e) => setSendWebPush(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>PWA Web Push</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Kotak Masuk Host</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={playSound}
                    onChange={(e) => setPlaySound(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Bunyikan Chime</span>
                </label>
              </div>
            </div>

            {/* RIGHT COLUMN: Recipient Host Picker */}
            <div className="w-full lg:w-[360px] flex flex-col gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 lg:pl-6 pt-4 lg:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  2. Penerima Notifikasi
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {selectedHostIds.size} Host Dipilih
                </span>
              </div>

              {/* Filter Scope Pills */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setFilterScope('active_week')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterScope === 'active_week'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Host Terjadwal ({hostsWithScheduleStats.filter((h) => h.hasSchedule).length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterScope('all_hosts')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterScope === 'all_hosts'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semua Host ({hosts.length})
                </button>
              </div>

              {/* Search & Select All Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={hostSearch}
                    onChange={(e) => setHostSearch(e.target.value)}
                    placeholder="Cari nama host..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer shrink-0 border border-indigo-200/60"
                >
                  Toggle Semua
                </button>
              </div>

              {/* Scrollable Host List */}
              <div className="flex-1 max-h-[300px] lg:max-h-[360px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
                {displayedHosts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    Tidak ada host yang sesuai filter.
                  </div>
                ) : (
                  displayedHosts.map(({ host, sessionCount, brands, days, hasSchedule }) => {
                    const isSelected = selectedHostIds.has(host.id);
                    return (
                      <div
                        key={host.id}
                        onClick={() => handleToggleHost(host.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-50/50 border-indigo-200/90 shadow-3xs'
                            : 'bg-white border-slate-200/70 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer shrink-0"
                          />
                          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                            {host.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-slate-800 truncate leading-tight">
                              {host.name}
                            </h6>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {host.studio || 'Studio'}
                            </span>
                          </div>
                        </div>

                        {/* Shift Badge */}
                        <div className="shrink-0 text-right">
                          {hasSchedule ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {sessionCount} Sesi
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
                              0 Sesi
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {!sendSuccessResult && (
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              Siap dikirim ke <strong className="text-slate-800">{selectedHostIds.size} Host Terpilih</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || selectedHostIds.size === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim Push Notifikasi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Push Notifikasi ({selectedHostIds.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
