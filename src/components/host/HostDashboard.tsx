import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, MapPin, User, FileText, Calendar as CalendarIcon,
  CheckCircle2, AlertTriangle, ChevronDown, Clock,
  Image, ExternalLink, Sun, LogOut, Home, PieChart, ScanLine, MessageSquare, ChevronLeft, ChevronRight, Filter, Fingerprint, BarChart2, X, TrendingUp,
  DollarSign, Package, ShoppingCart, Activity, Search, Check, CheckCheck,
  Smartphone, Sparkles, ShieldCheck, Download, Radio,
  CreditCard, Phone, Edit3, Copy, Building2, Camera, Trash2, Send, Share2, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCutoffPeriodOptionLabel } from '../../shared/utils/reporting';
import { getCutoffMonthForDate } from '../../shared/utils/appUi';
import { activityLogsApi, hostsApi, hostNotificationsApi } from '../../api';
import {
  isWebPushSupported,
  getNotificationPermission,
  getExistingSubscription,
  subscribeDeviceToPush,
  unsubscribeDeviceFromPush,
  syncPushSubscriptionIfGranted,
} from '../../shared/utils/webPush';
import AnalysisPerformanceTab from '../reporting/AnalysisPerformanceTab';
import { MobileLiveDailyTable } from '../reporting/MobileLiveDailyTable';
import { MobileLiveMetricsPanel } from '../reporting/MobileLiveMetricsPanel';

const formatShortCutoff = (period: string) => {
  if (period === 'Semua') return 'Semua Waktu';
  const [yrStr, moStr] = period.split('-');
  const yr = Number(yrStr);
  const m = Number(moStr);
  if (!yr || !m) return period;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Des'];
  let prevM = m - 1;
  if (prevM === 0) prevM = 12;
  return `16 ${monthNames[prevM - 1]} - 15 ${monthNames[m - 1]} ${yr}`;
};


function CustomSelect({ value, options, onChange, placeholder, error }: any) {
  // normalize options to {value, label} format
  const normalizedOptions = options.map((opt: any) => typeof opt === 'string' ? { value: opt, label: opt } : opt);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${error ? 'border-red-300 ring-4 ring-red-50' : isOpen ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-200'} text-left rounded-xl px-4 py-3 text-xs outline-none transition-all flex items-center justify-between group`}
      >
        <span className={`font-bold ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden"
          >
            <div className="max-h-[220px] overflow-y-auto p-1">
              {normalizedOptions.map((opt: any) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {opt.label}
                  {value === opt.value && <CheckCircle2 size={14} className="text-purple-600" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function compressImage(file: File, maxWidth = 1280, quality = 0.82): Promise<{ dataUrl: string; file: File }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ dataUrl: e.target?.result as string, file });
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], (file.name || 'attendance').replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve({ dataUrl, file: compressedFile });
            } else {
              resolve({ dataUrl, file });
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface HostDashboardProps {
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
  setHostCalendarMonth: React.Dispatch<React.SetStateAction<number>>;
  setHostCalendarYear: React.Dispatch<React.SetStateAction<number>>;
  hostCutoffPeriod: string;
  setHostCutoffPeriod: React.Dispatch<React.SetStateAction<string>>;
  availableCutoffMonths: string[];
  computedSchedules: any[];
  violations: any[];
  brandPerformanceLogs: any[];
  onOpenFullReporting?: (brandId: string) => void;
  onRefreshData?: () => Promise<void>;
  onUpdateHost?: (hostId: string, fields: any, silent?: boolean) => Promise<void> | void;
  hostNotifications?: any[];
  onMarkHostNotificationAsRead?: (hostId: string) => void;
  lastSubmittedAttendanceLog?: any;
  setLastSubmittedAttendanceLog?: (log: any) => void;
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
  setHostCalendarMonth,
  setHostCalendarYear,
  hostCutoffPeriod,
  setHostCutoffPeriod,
  availableCutoffMonths,
  computedSchedules,
  violations,
  brandPerformanceLogs,
  onOpenFullReporting,
  onRefreshData,
  onUpdateHost,
  hostNotifications,
  onMarkHostNotificationAsRead,
  lastSubmittedAttendanceLog,
  setLastSubmittedAttendanceLog,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'absen' | 'rekap' | 'kalender' | 'performance' | 'account'>('beranda');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [hostPhotoModal, setHostPhotoModal] = useState<{ url: string; brand: string; date: string; shift: string } | null>(null);
  const [hostPhotoImgError, setHostPhotoImgError] = useState(false);
  const [serverNotifications, setServerNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!activeHostObj?.id) return;
    const fetchNotifs = () => {
      hostNotificationsApi.getAll(activeHostObj.id).then((data) => {
        if (Array.isArray(data)) {
          setServerNotifications(data);
        }
      }).catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [activeHostObj?.id]);

  const myNotifications = useMemo(() => {
    const list = serverNotifications.length > 0 ? serverNotifications : (hostNotifications || []);
    return list.filter((n: any) => n.hostId === activeHostObj?.id || n.hostId === 'all');
  }, [serverNotifications, hostNotifications, activeHostObj]);

  const unreadNotifCount = myNotifications.filter((n: any) => !n.read).length;

  // Web Push HP (Lock-Screen Push) Notification State
  const [pushStatus, setPushStatus] = useState<'checking' | 'active' | 'inactive' | 'denied' | 'unsupported'>('checking');
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);
  const [isPushBannerDismissed, setIsPushBannerDismissed] = useState(false);

  useEffect(() => {
    if (!activeHostObj?.id) return;
    let isMounted = true;

    const checkPush = async () => {
      if (!isWebPushSupported()) {
        if (isMounted) setPushStatus('unsupported');
        return;
      }
      const perm = getNotificationPermission();
      if (perm === 'denied') {
        if (isMounted) setPushStatus('denied');
        return;
      }

      const existing = await getExistingSubscription();
      if (existing && perm === 'granted') {
        if (isMounted) setPushStatus('active');
        syncPushSubscriptionIfGranted(activeHostObj.id).catch(() => {});
      } else {
        if (isMounted) setPushStatus('inactive');
      }
    };

    checkPush();
    return () => { isMounted = false; };
  }, [activeHostObj?.id]);

  const handleEnablePushNotification = async () => {
    if (!activeHostObj?.id) return;
    setIsPushLoading(true);
    setPushFeedback(null);
    try {
      const res = await subscribeDeviceToPush(activeHostObj.id);
      if (res.success) {
        setPushStatus('active');
        setPushFeedback('✅ Berhasil! Notifikasi HP telah aktif. Kamu akan menerima pemberitahuan langsung di layar kunci HP.');
      } else {
        setPushFeedback(`⚠️ ${res.error || 'Gagal mengaktifkan notifikasi.'}`);
        if (getNotificationPermission() === 'denied') {
          setPushStatus('denied');
        }
      }
    } catch (err: any) {
      setPushFeedback(`⚠️ ${err?.message || 'Terjadi kesalahan sistem.'}`);
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleDisablePushNotification = async () => {
    setIsPushLoading(true);
    setPushFeedback(null);
    try {
      const res = await unsubscribeDeviceFromPush();
      if (res.success) {
        setPushStatus('inactive');
        setPushFeedback('Notifikasi HP telah dinonaktifkan di perangkat ini.');
      }
    } catch (err: any) {
      setPushFeedback(`⚠️ ${err?.message || 'Gagal menonaktifkan notifikasi.'}`);
    } finally {
      setIsPushLoading(false);
    }
  };


  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bankName: '',
    bankAccount: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (activeHostObj && !isEditingProfile) {
      setProfileForm({
        name: activeHostObj.name || '',
        phone: activeHostObj.phone || '',
        bankName: activeHostObj.bankName || activeHostObj.bank_name || '',
        bankAccount: activeHostObj.bankAccount || activeHostObj.bank_account || ''
      });
    }
  }, [activeHostObj, isEditingProfile]);

  const handleSaveProfile = async () => {
    if (!activeHostObj) return;
    setProfileErrorMsg('');
    try {
      setIsSavingProfile(true);
      const payload = {
        ...activeHostObj,
        name: profileForm.name.trim() || activeHostObj.name,
        phone: profileForm.phone.trim(),
        bankName: profileForm.bankName.trim(),
        bankAccount: profileForm.bankAccount.trim()
      };

      if (onUpdateHost) {
        await onUpdateHost(activeHostObj.id, payload, true);
      } else {
        await hostsApi.update(activeHostObj.id, payload);
      }

      setIsEditingProfile(false);
      setProfileSuccessMsg('Data kontak & rekening bank berhasil diperbarui!');
      setTimeout(() => setProfileSuccessMsg(''), 4500);

      if (onRefreshData && !onUpdateHost) {
        await onRefreshData();
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setProfileErrorMsg(err?.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSavingProfile(false);
    }
  };
  const [selectedPerfBrandId, setSelectedPerfBrandId] = useState<string | null>(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);

  const hostSchedules = useMemo(() => {
    return (computedSchedules || []).filter(s => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay);
  }, [computedSchedules, activeHostObj]);

  const hostClientBrands = useMemo(() => {
    if (!activeHostObj || !clientBrands) return [];
    
    return clientBrands.filter((cb: any) => {
      const hostNameLower = activeHostObj.name?.trim().toLowerCase();
      if (cb.sessions && Array.isArray(cb.sessions)) {
        return cb.sessions.some((session: any) => session.host?.trim().toLowerCase() === hostNameLower);
      }
      return false;
    });
  }, [activeHostObj, clientBrands]);

  useEffect(() => {
    if (activeTab === 'performance' && !selectedPerfBrandId && hostClientBrands.length > 0) {
      setSelectedPerfBrandId(hostClientBrands[0].id);
    }
  }, [activeTab, hostClientBrands, selectedPerfBrandId]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weeklyOffset, setWeeklyOffset] = useState(0); // Offset in weeks from current week
  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Photo capture & WhatsApp group share states
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waModalData, setWaModalData] = useState<any>(null);
  const [waCopied, setWaCopied] = useState(false);

  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  // Trigger WhatsApp share modal when attendance is submitted
  useEffect(() => {
    if (lastSubmittedAttendanceLog) {
      setWaModalData(lastSubmittedAttendanceLog);
      setIsWaModalOpen(true);
      setIsAbsenModalOpen(false);
    }
  }, [lastSubmittedAttendanceLog]);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingPhoto(true);
    setHostFormError('');
    try {
      const compressed = await compressImage(file, 1280, 0.82);
      setHostForm((prev: any) => ({
        ...prev,
        photo: compressed.dataUrl,
        photoFile: compressed.file,
      }));
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      setHostFormError('Gagal memproses gambar foto. Silakan coba lagi.');
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = '';
    }
  };

  const generateWaMessage = (data: any) => {
    if (!data) return '';
    const hostName = data.hostName || activeHostObj?.name || '-';
    const brand = data.brandHandled || data.brand || '-';
    const shift = data.shiftHours || data.shift || '-';
    const platform = data.platform || '-';

    return `${hostName}-${brand}\n${shift}-${platform}`;
  };

  const handleSendToWhatsApp = async () => {
    if (!waModalData) return;
    const text = generateWaMessage(waModalData);

    // If photoFile exists and browser supports sharing files (mobile browsers)
    if (hostForm.photoFile && navigator.canShare && navigator.canShare({ files: [hostForm.photoFile] })) {
      try {
        await navigator.share({
          title: `Absensi Host - ${waModalData.hostName || activeHostObj?.name}`,
          text: text,
          files: [hostForm.photoFile],
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('Native share failed, fallback to URL:', err);
      }
    }

    // Fallback: Copy to clipboard and open WhatsApp
    try {
      await navigator.clipboard.writeText(text);
      setWaCopied(true);
      setTimeout(() => setWaCopied(false), 3000);
    } catch (e) {}

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownloadPhoto = () => {
    const photoSrc = waModalData?.proofUrl || waModalData?.proof_url || hostForm.photo;
    if (!photoSrc) return;
    const a = document.createElement('a');
    a.href = photoSrc;
    a.download = `absen-${(activeHostObj?.name || 'host').replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showFormSuccess) {
      setIsAbsenModalOpen(false);
    }
  }, [showFormSuccess]);

  useEffect(() => {
    if (activeHostObj) {
      activityLogsApi.create({
        hostId: activeHostObj.id,
        action: "PAGE_LOAD",
        details: { message: "Host opened/refreshed the dashboard" }
      }).catch(() => {});
    }
  }, [activeHostObj]);

  useEffect(() => {
    if (activeHostObj?.id) {
      setHasAutoFilled(false);
      const today = new Date();
      setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
      setWeeklyOffset(0);
      setSelectedPerfBrandId(null);
    }
  }, [activeHostObj?.id]);

  const getSchedulePlatform = (schedule: any): string => {
    if (!schedule) return '-';
    if (schedule.platform && typeof schedule.platform === 'string' && schedule.platform.trim()) {
      return schedule.platform.trim();
    }
    const brandName = schedule.brandHandled || schedule.brand;
    const schedShift = schedule.timeSlot || schedule.shift;
    if (brandName && clientBrands && clientBrands.length > 0) {
      const cb = clientBrands.find(
        (c: any) => 
          (c.name || '').trim().toLowerCase() === (brandName || '').trim().toLowerCase() || 
          c.id === brandName
      );
      if (cb) {
        if (Array.isArray(cb.sessions) && cb.sessions.length > 0) {
          const matchedSession = cb.sessions.find(
            (sess: any) => sess.shift && schedShift && (
              sess.shift.trim().toLowerCase() === schedShift.trim().toLowerCase() ||
              schedShift.includes(sess.shift) ||
              sess.shift.includes(schedShift)
            )
          );
          if (matchedSession?.platform && matchedSession.platform.trim()) {
            return matchedSession.platform.trim();
          }
          if (cb.sessions[0]?.platform && cb.sessions[0].platform.trim()) {
            return cb.sessions[0].platform.trim();
          }
        }
        if (cb.platform && typeof cb.platform === 'string' && cb.platform.trim()) {
          return cb.platform.trim();
        }
      }
    }
    if (brandName && brands && brands.length > 0) {
      const b = brands.find(
        (br: any) => (br.name || '').trim().toLowerCase() === (brandName || '').trim().toLowerCase()
      );
      if (b?.platform && typeof b.platform === 'string' && b.platform.trim()) {
        return b.platform.trim();
      }
    }
    if (Array.isArray(activeHostObj?.platforms) && activeHostObj.platforms.length === 1) {
      return activeHostObj.platforms[0];
    }
    return '-';
  };

  useEffect(() => {
    if (!activeHostObj || !computedSchedules) return;
    if (hasAutoFilled) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todaySchedule = computedSchedules.find(
      (s) => s.hostId === activeHostObj.id && !s.isDeleted && !s.isOffDay && s.date === todayStr
    );

    if (todaySchedule) {
      const resolvedPlatform = todaySchedule.platform || getSchedulePlatform(todaySchedule);
      setHostForm({
        brand: todaySchedule.brandHandled || todaySchedule.brand || '',
        platform: (resolvedPlatform && resolvedPlatform !== '-') ? resolvedPlatform : '',
        shift: todaySchedule.timeSlot || todaySchedule.shift || '',
        studio: todaySchedule.studio || activeHostObj.studio || ''
      });
    } else {
      // Empty the form if there's no schedule for today
      setHostForm({
        brand: '',
        platform: '',
        shift: '',
        studio: ''
      });
    }
    setHasAutoFilled(true);
  }, [activeHostObj, computedSchedules, setHostForm, hasAutoFilled]);

  const handlePrevMonth = () => {
    if (hostCalendarMonth === 0) {
      setHostCalendarMonth(11);
      setHostCalendarYear((y: number) => y - 1);
    } else {
      setHostCalendarMonth((m: number) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (hostCalendarMonth === 11) {
      setHostCalendarMonth(0);
      setHostCalendarYear((y: number) => y + 1);
    } else {
      setHostCalendarMonth((m: number) => m + 1);
    }
  };



  const { disciplineScore, avgEarlyArrival, readinessRate, attendanceHistory } = useMemo(() => {
    let score = 100;
    let totalEarlyMinutes = 0;
    let earlyCount = 0;
    let validShifts = 0;
    let toleransiCount = 0;
    
    // Sort logs from oldest to newest to apply score sequentially
    const sortedLogs = [...(hostLogs || [])].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    const history: Array<{
      date: string;
      brand: string;
      shift: string;
      status: string;
      pointChange: number;
      reason: string;
      earlyMinutes: number;
      checkInTime?: string;
    }> = [];

    sortedLogs.forEach(log => {
      let pointChange = 0;
      let reason = "";
      let earlyMinutes = 0;

      if (log.status === 'Absent') {
        pointChange = -15;
        reason = "Mangkir (Tanpa Keterangan)";
      } else if (log.status === 'Excused') {
        pointChange = 0;
        reason = "Izin/Sakit";
      } else if (log.checkInTime && log.shiftHours) {
        const match = log.shiftHours.match(/(\d{1,2}[:.]\d{2})/);
        if (match) {
          const shiftStartStr = match[1].replace('.', ':');
          const shiftDate = new Date(`${log.date}T${shiftStartStr}:00`);
          const normalizedCheckInTime = log.checkInTime.replace(/\./g, ':');
          const checkInDate = new Date(`${log.date}T${normalizedCheckInTime}`);
          
          if (!isNaN(shiftDate.getTime()) && !isNaN(checkInDate.getTime())) {
            const diffMs = shiftDate.getTime() - checkInDate.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            earlyMinutes = diffMins;
            validShifts++;
            
            if (log.status === 'Present' && diffMins < 0) {
              pointChange = 0;
              reason = `Tepat Waktu`;
              totalEarlyMinutes += 0;
            } else if (diffMins >= 0) {
              pointChange = 0;
              reason = `Tepat Waktu`;
              totalEarlyMinutes += diffMins;
              if (diffMins >= 30) earlyCount++;
            } else if (diffMins < 0 && diffMins >= -5) {
              if (toleransiCount < 3) {
                pointChange = -5;
                reason = `Toleransi Telat (${Math.abs(diffMins)}m)`;
                toleransiCount++;
              } else {
                pointChange = -10;
                reason = `Telat (${Math.abs(diffMins)}m)`;
              }
            } else if (diffMins < -5) {
              pointChange = -10;
              reason = `Telat (${Math.abs(diffMins)}m)`;
            }
          }
        }
      }

      if (!reason) {
        if (log.status === 'Late') {
          pointChange = -10;
          reason = 'Telat (Manual)';
        } else if (log.status === 'Present') {
          pointChange = 0;
          reason = 'Tepat Waktu (Manual)';
        }
      }

      score += pointChange;
      
      history.push({
        date: log.date,
        brand: log.brandHandled,
        shift: log.shiftHours,
        status: log.status,
        pointChange,
        reason,
        earlyMinutes,
        checkInTime: log.checkInTime,
        platform: log.platform || '',
        proofUrl: log.proofUrl || log.proof_url || log.proofImage || log.proof_image,
      });
    });

    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    hostSchedules.forEach(schedule => {
      if (schedule.date > todayStr) return;
      if (hostCutoffPeriod && hostCutoffPeriod !== 'Semua') {
        if (getCutoffMonthForDate(schedule.date) !== hostCutoffPeriod) return;
      }
      
      const schedShift = schedule.timeSlot || schedule.shift || '';
      const hasLog = history.some(h => h.date === schedule.date && h.shift === schedShift && (h.brand === schedule.brandHandled || h.brand === schedule.brand));
      
      if (!hasLog) {
        const schedPlatform = schedule.platform || getSchedulePlatform(schedule);
        history.push({
          date: schedule.date,
          brand: schedule.brandHandled || schedule.brand || '',
          shift: schedShift,
          status: 'Belum Absen',
          pointChange: 0,
          reason: 'Belum Absen',
          earlyMinutes: 0,
          checkInTime: '-',
          platform: (schedPlatform && schedPlatform !== '-') ? schedPlatform : '',
        });
      }
    });

    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      disciplineScore: Math.min(100, Math.max(0, score)),
      avgEarlyArrival: validShifts > 0 ? Math.round(totalEarlyMinutes / validShifts) : 0,
      readinessRate: validShifts > 0 ? Math.round((earlyCount / validShifts) * 100) : 0,
      attendanceHistory: history,
    };
  }, [hostLogs, hostSchedules, hostCutoffPeriod]);

  // Extract unique brands for the legend and assign a color index
  const uniqueBrands = Array.from(new Set(hostSchedules.map(s => s.brandHandled || s.brand)));
  const brandColors = [
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500', solid: 'bg-purple-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', solid: 'bg-emerald-500' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', solid: 'bg-blue-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', solid: 'bg-amber-500' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', solid: 'bg-rose-500' },
  ];

  const getBrandColor = (brand: string) => {
    const idx = uniqueBrands.indexOf(brand);
    return brandColors[idx % brandColors.length];
  };

  const kalenderStats = useMemo(() => {
    let hadir = 0;
    let telat = 0;
    let tidakHadir = 0;
    // Filter by cutoff period
    const monthLogs = (hostLogs || []).filter(log => {
      if (hostCutoffPeriod === 'Semua') return true;
      return getCutoffMonthForDate(log.date) === hostCutoffPeriod;
    });

    monthLogs.forEach(log => {
      if (log.status === 'Present') hadir++;
      else if (log.status === 'Late') telat++;
      else if (log.status === 'Absent' || log.status === 'Excused') tidakHadir++;
    });

    return { hadir, telat, tidakHadir };
  }, [hostLogs, hostCutoffPeriod]);

  const renderFullCalendarDays = () => {
    const daysInMonth = new Date(hostCalendarYear, hostCalendarMonth + 1, 0).getDate();
    const firstDayRaw = new Date(hostCalendarYear, hostCalendarMonth, 1).getDay();
    const firstDay = (firstDayRaw + 6) % 7; // Monday = 0, Sunday = 6
    const days = [];
    
    // Previous month empty days
    const prevMonthDays = new Date(hostCalendarYear, hostCalendarMonth, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-prev-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-300 font-medium text-sm">
          {prevMonthDays - firstDay + i + 1}
        </div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const schedule = hostSchedules.find(s => s.date === dateStr);
      const log = (hostLogs || []).find(l => l.date === dateStr);
      
      let brandStyle = null;
      if (schedule) {
        const brand = schedule.brandHandled || schedule.brand;
        brandStyle = getBrandColor(brand);
      }

      const hasCheckedIn = log && (log.status === 'Present' || log.status === 'Late' || log.checkInTime);
      const textColorClass = hasCheckedIn ? 'text-emerald-600' : brandStyle ? brandStyle.text : 'text-slate-400';

      const buttonClasses = isSelected
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
        : brandStyle 
          ? `${brandStyle.bg} ${textColorClass}` 
          : `${textColorClass} hover:bg-slate-50`;

      days.push(
        <div key={`day-${day}`} className="flex flex-col items-center justify-center relative w-10 h-11">
          <button 
            onClick={() => setSelectedDate(dateStr)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold transition-all z-10 ${buttonClasses}`}
          >
            {day}
          </button>
        </div>
      );
    }
    
    // Next month empty days
    const totalSlots = days.length;
    const remainingSlots = 42 - totalSlots; // 6 rows of 7
    for (let i = 1; i <= remainingSlots; i++) {
      if (days.length % 7 === 0 && remainingSlots < 7 && i > 1) break; // Don't add an empty 6th row
      days.push(
        <div key={`empty-next-${i}`} className="w-10 h-11 flex items-center justify-center text-slate-300 font-medium text-sm">
          {i}
        </div>
      );
    }
    
    return days;
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(hostCalendarYear, hostCalendarMonth + 1, 0).getDate();
    const firstDay = new Date(hostCalendarYear, hostCalendarMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const todayStrObj = new Date();
    const todayStr = `${todayStrObj.getFullYear()}-${String(todayStrObj.getMonth() + 1).padStart(2, '0')}-${String(todayStrObj.getDate()).padStart(2, '0')}`;

    return Array.from({ length: 42 }).map((_, i) => {
      if (i < adjustedFirstDay || i >= adjustedFirstDay + daysInMonth) {
        return <div key={`empty-${i}`} className="py-1.5" />;
      }
      
      const day = i - adjustedFirstDay + 1;
      
      // Check if there is a schedule for this date
      const dateStr = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySchedule = hostSchedules.find(s => s.date === dateStr);

      let style = 'bg-white text-slate-500 border border-slate-200';
      let isPassedAndCheckedIn = false;

      if (daySchedule) {
        const hasCheckedInOnDate = hostLogs?.some(
          (log) => log.hostId === activeHostObj?.id && log.date === dateStr
        );

        if (hasCheckedInOnDate) {
          isPassedAndCheckedIn = true;
          style = `bg-emerald-700 text-white border-2 border-emerald-800 font-black relative group`;
        } else {
          const brand = daySchedule.brandHandled || daySchedule.brand;
          const colorObj = getBrandColor(brand);
          style = `${colorObj.bg} ${colorObj.text} border-2 ${colorObj.border} font-black`;
        }
      }
      
      return (
        <div key={day} onClick={() => setSelectedDate(dateStr)} className={`py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all ${style} ${selectedDate === dateStr ? 'ring-2 ring-purple-500 ring-offset-1 scale-110 z-10' : ''}`}>
          {day}
          {isPassedAndCheckedIn && (
            <span className="hidden group-hover:block absolute bottom-full mb-1 bg-emerald-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
              Sudah Absen
            </span>
          )}
        </div>
      );
    });
  };

  const initials = activeHostObj?.name 
    ? activeHostObj.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'NA';

  // Check schedule and attendance for today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const hasScheduleToday = computedSchedules?.some(
    (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === todayStr
  );
  
  const hasCheckedInToday = hostLogs?.some(
    (log) => log.hostId === activeHostObj?.id && log.date === todayStr
  );
  const hasCheckedInSelectedDate = hostLogs?.some(
    (log) => log.hostId === activeHostObj?.id && log.date === selectedDate
  );

  // Check schedule for today and tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  const timeRegex = /\b(\d{2}[.:]\d{2})\b/;
  const sortByTime = (schedules: any[]) => {
    return [...schedules].sort((a, b) => {
      const matchA = (a.timeSlot || "").match(timeRegex);
      const matchB = (b.timeSlot || "").match(timeRegex);
      const timeA = matchA ? matchA[1].replace('.', ':') : (a.timeSlot || "");
      const timeB = matchB ? matchB[1].replace('.', ':') : (b.timeSlot || "");
      return timeA.localeCompare(timeB);
    });
  };

  const selectedSchedules = (computedSchedules || []).filter(
    (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === selectedDate
  );

  const sortedSelectedSchedules = sortByTime(selectedSchedules);

  let upcomingSchedule = null;
  let upcomingDateStr = "";
  let upcomingLabel = "";
  let isNextUpcomingFallback = false;

  const nextUpcomingScheduleObj = (() => {
    if (!computedSchedules || !activeHostObj) return null;
    const futureSchedules = computedSchedules
      .filter((s) => s.hostId === activeHostObj.id && !s.isDeleted && !s.isOffDay && s.date > (selectedDate || todayStr))
      .sort((a, b) => a.date.localeCompare(b.date));
    return futureSchedules[0] || null;
  })();

  if (sortedSelectedSchedules.length > 0) {
    upcomingSchedule = sortedSelectedSchedules[0];
    upcomingDateStr = selectedDate || todayStr;
    if (selectedDate === todayStr) {
      upcomingLabel = "Jadwal Hari Ini";
    } else if (selectedDate === tomorrowStr) {
      upcomingLabel = "Jadwal Besok";
    } else {
      const d = new Date(selectedDate || "");
      upcomingLabel = isNaN(d.getTime()) ? "Jadwal" : `Jadwal ${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
    }
  } else {
    // Tidak ada jadwal pada selectedDate yang dipilih
    upcomingSchedule = null;
    upcomingDateStr = selectedDate || todayStr;
    if (nextUpcomingScheduleObj) {
      isNextUpcomingFallback = true;
    }
  }

  let statusLabel = '';
  let statusStyle = '';
  let StatusIcon = null;

  if (!hasScheduleToday) {
    statusLabel = 'Kamu tidak ada jadwal hari ini';
    statusStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    StatusIcon = CalendarIcon;
  } else if (hasCheckedInToday) {
    statusLabel = 'Kamu sudah absen';
    statusStyle = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    StatusIcon = CheckCircle2;
  } else {
    statusLabel = 'Kamu belum absen hari ini';
    statusStyle = 'bg-amber-50 text-amber-600 border-amber-200';
    StatusIcon = AlertTriangle;
  }

  const selectedDateFormatted = (() => {
    if (!selectedDate) return 'Hari ini';
    if (selectedDate === todayStr) return 'Hari ini';
    if (selectedDate === tomorrowStr) return 'Besok';
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? selectedDate : d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  })();

  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen bg-[#f8f9fc] p-4 font-sans text-slate-800 pb-28 overflow-x-hidden">
      
      {/* Top Profile Header (Mobile App Style) */}
      <div className="flex items-center justify-between py-2 mb-6">
        <div 
          onClick={() => setActiveTab('account')}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
          title="Buka Profil & Rekening Bank"
        >
          <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold border-[3px] border-white shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 transition-all">
            {/* Display profilePicture if exists, otherwise show initials */}
            {(activeHostObj as any)?.profilePicture ? (
              <img src={(activeHostObj as any).profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : <User className="w-6 h-6 fill-current" />}
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="text-[17px] font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
              {activeHostObj?.name || 'Host'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {activeHostObj?.studio || 'Studio Host'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <button 
            type="button"
            onClick={() => setIsNotificationsModalOpen(true)}
            aria-label="Notifikasi PWA"
            className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer"
          >
            <Bell className="w-[22px] h-[22px]" />
            {unreadNotifCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white flex items-center justify-center shadow-sm animate-pulse">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            ) : null}
          </button>
          
          <button onClick={handleLogout} className="relative w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-500 cursor-pointer">
            <LogOut className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      {/* Konten Home / Beranda */}
      {activeTab === 'beranda' && (
      <div className="mt-2 animate-fadeIn">
        {/* Banner Notifikasi Layar Kunci HP (Web Push) */}
        {pushStatus === 'inactive' && !isPushBannerDismissed && (
          <div className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25 shadow-inner">
                <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-[13px] text-white">
                      Aktifkan Notifikasi di HP
                    </h4>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-900 tracking-wide uppercase">
                      Penting
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPushBannerDismissed(true)}
                    className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label="Tutup Banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-indigo-100/90 mt-1 leading-relaxed">
                  Dapatkan bunyi dan pop-up jadwal siaran langsung di layar kunci HP kamu meskipun aplikasi sedang ditutup!
                </p>
                {pushFeedback && (
                  <div className="mt-2 text-[11px] font-semibold bg-black/30 px-3 py-1.5 rounded-xl text-amber-200">
                    {pushFeedback}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPushLoading}
                    onClick={handleEnablePushNotification}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPushLoading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                    {isPushLoading ? 'Menghubungkan ke HP...' : 'Aktifkan Notifikasi HP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pushStatus === 'denied' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold">Izin Notifikasi HP Terblokir</strong>
              <span className="text-[11px] text-rose-600 block mt-0.5 leading-snug">
                Izin notifikasi diblokir di browser HP kamu. Untuk menerima jadwal saat aplikasi ditutup, buka pengaturan situs di browser HP kamu dan aktifkan izin notifikasi.
              </span>
            </div>
          </div>
        )}

        {/* Calendar Strip */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-[15px]">
              {(() => {
                const today = new Date();
                today.setDate(today.getDate() + (weeklyOffset * 7));
                return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              })()}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setWeeklyOffset(prev => prev - 1)} className="w-8 h-8 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={() => setWeeklyOffset(prev => prev + 1)} className="w-8 h-8 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex justify-between mb-6 px-1">
          {(() => {
            const today = new Date();
            const dayOfWeek = today.getDay() || 7; // Make Monday=1, Sunday=7
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek + 1 + (weeklyOffset * 7));

            return Array.from({ length: 7 }).map((_, i) => {
              const currentDay = new Date(startOfWeek);
              currentDay.setDate(startOfWeek.getDate() + i);
              const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
              const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short' });
              const isActive = selectedDate === dateStr;
              
              const hasSchedule = hostSchedules.some(s => s.date === dateStr);
              const log = (hostLogs || []).find(l => l.date === dateStr);
              const hasCheckedIn = log && (log.status === 'Present' || log.status === 'Late' || log.checkInTime);
              
              const textColorClass = hasCheckedIn ? 'text-emerald-600' : hasSchedule ? 'text-slate-700' : 'text-slate-400';

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setSelectedDate(dateStr)}>
                  <span className={`text-[11px] font-medium ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{dayName}</span>
                  <div className={`w-10 h-11 flex flex-col items-center justify-center rounded-xl transition-all relative ${
                    isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : textColorClass
                  }`}>
                    <span className="font-bold text-[15px]">{currentDay.getDate()}</span>
                    {isActive && <div className="absolute -bottom-2 w-4 h-1 bg-blue-600 rounded-full" />}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* JADWAL Card */}
        {upcomingSchedule ? (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[24px] p-5 text-white shadow-[0_8px_24px_rgba(79,70,229,0.25)] mb-8 relative overflow-hidden">
            {/* subtle decorative blur behind */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase">{upcomingLabel}</span>
                {getSchedulePlatform(upcomingSchedule) !== '-' && (
                  <span className="bg-white/15 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-white/20 shadow-xs">
                    <Radio size={11} className="text-emerald-300 animate-pulse shrink-0" />
                    <span>{getSchedulePlatform(upcomingSchedule)}</span>
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3.5 mt-4 mb-6">
                <div>
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Brand</div>
                  <div className="font-bold text-[14px] leading-tight pr-1">{upcomingSchedule.brandHandled || upcomingSchedule.brand}</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Platform</div>
                  <div className="font-bold text-[14px] leading-tight pr-1 flex items-center gap-1.5">
                    <span>{getSchedulePlatform(upcomingSchedule)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Shift</div>
                  <div className="font-bold text-[14px] leading-tight pr-1">{upcomingSchedule.timeSlot || upcomingSchedule.shift}</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Studio</div>
                  <div className="font-bold text-[14px] leading-tight">{upcomingSchedule.studio || '-'}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    if (upcomingSchedule) {
                      const plat = upcomingSchedule.platform || getSchedulePlatform(upcomingSchedule);
                      setHostForm((prev: any) => ({
                        ...prev,
                        brand: upcomingSchedule.brandHandled || upcomingSchedule.brand || prev.brand,
                        platform: (plat && plat !== '-') ? plat : prev.platform,
                        shift: upcomingSchedule.timeSlot || upcomingSchedule.shift || prev.shift,
                        studio: upcomingSchedule.studio || prev.studio,
                      }));
                    }
                    setIsAbsenModalOpen(true);
                  }}
                  className="bg-white text-blue-600 rounded-[14px] px-4 py-2.5 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                  <Clock size={16} className="text-blue-500" /> {hasCheckedInSelectedDate ? 'Sudah Absen' : 'Belum Absen'}
                </button>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/80 font-medium mb-0.5">Jam Mulai</span>
                  <span className="font-black text-xl tracking-wide font-mono">
                    {(() => {
                      const match = (upcomingSchedule.timeSlot || "").match(/\b(\d{2}[.:]\d{2})\b/);
                      if (!match) return "-";
                      const formattedTime = match[1].replace('.', ':');
                      const targetDate = new Date(`${upcomingDateStr}T${formattedTime}:00`);
                      if (isNaN(targetDate.getTime())) return "-";
                      
                      const diffMs = targetDate.getTime() - currentTime.getTime();
                      if (diffMs <= 0) return "Tiba!";
                      
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                      
                      return `${String(diffHours).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Jadwal</h4>
                <p className="text-xs text-slate-500">{selectedDateFormatted}</p>
              </div>
            </div>
            
            {nextUpcomingScheduleObj ? (
              <div className="bg-blue-50/60 rounded-2xl p-3.5 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      Jadwal Berikutnya: {nextUpcomingScheduleObj.date === tomorrowStr ? 'Besok' : new Date(nextUpcomingScheduleObj.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-800">
                    {nextUpcomingScheduleObj.brandHandled || nextUpcomingScheduleObj.brand}
                    {getSchedulePlatform(nextUpcomingScheduleObj) !== '-' && (
                      <span className="text-blue-600 font-semibold"> • {getSchedulePlatform(nextUpcomingScheduleObj)}</span>
                    )}
                    {nextUpcomingScheduleObj.studio && ` • ${nextUpcomingScheduleObj.studio}`}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {nextUpcomingScheduleObj.timeSlot || nextUpcomingScheduleObj.shift}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDate(nextUpcomingScheduleObj.date)}
                  className="text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  Lihat
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">Kamu tidak memiliki jadwal pada tanggal ini.</p>
            )}
          </div>
        )}

        {/* History Kehadiran */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-[15px]">History Kehadiran</h3>
            <div className="relative inline-block">
              {/* Custom UI for Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm pointer-events-none">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs font-bold text-slate-600 truncate max-w-[220px]">
                  {formatShortCutoff(hostCutoffPeriod)}
                </span>
                <ChevronRight size={14} className="text-slate-400 rotate-90 shrink-0 ml-1" />
              </div>

              {/* Invisible Native Select */}
              <select
                value={hostCutoffPeriod}
                onChange={(e) => setHostCutoffPeriod(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                {availableCutoffMonths.map((period) => (
                  <option key={period} value={period}>
                    {formatShortCutoff(period)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-3 pb-8">
            {attendanceHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold">Belum ada riwayat kehadiran</div>
            ) : (
              attendanceHistory.map((log, idx) => (
                <div key={idx} className="bg-white rounded-[20px] p-4 flex items-center gap-4 border border-slate-100 shadow-sm">
                   <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                     <CalendarIcon size={20} strokeWidth={1.5} />
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-2 flex-wrap mb-0.5">
                       <span className="font-bold text-slate-800 text-sm">{log.brand}</span>
                       {log.platform && log.platform !== '-' && (
                         <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                           {log.platform}
                         </span>
                       )}
                     </div>
                     <div className="text-[11px] text-slate-500 font-medium mb-0.5">{log.shift}</div>
                     <div className="text-[10px] text-slate-400 font-medium">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                       log.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                       log.status === 'Late' ? 'bg-rose-50 text-rose-500' :
                       'bg-slate-100 text-slate-500'
                     }`}>
                       {log.status === 'Present' ? 'Tepat Waktu' : log.status === 'Late' ? 'Telat' : log.status}
                     </div>
                     <div className={`font-bold text-sm ${log.status === 'Late' ? 'text-rose-500' : log.status === 'Belum Absen' || log.status === 'Absent' ? 'text-slate-400' : 'text-emerald-600'}`}>
                       {log.checkInTime && log.checkInTime !== '-' ? log.checkInTime.substring(0, 5) : '-'}
                     </div>
                     {log.proofUrl && (
                       <button
                         type="button"
                         onClick={() => { setHostPhotoImgError(false); setHostPhotoModal({ url: log.proofUrl, brand: log.brand, date: log.date, shift: log.shift }); }}
                         className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md mt-1.5 transition-colors cursor-pointer border-0 shadow-3xs"
                       >
                         <Eye size={12} />
                         <span>Lihat Foto</span>
                       </button>
                     )}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* Konten Kalender / Jadwal */}
      {activeTab === 'kalender' && (
        <div className="mt-2 animate-fadeIn pb-24 px-1">
          <div className="flex items-center justify-between mb-4 ml-1">
            <h2 className="text-[17px] font-black text-slate-800">Rekap Attendance</h2>
            <div className="relative inline-block">
              {/* Custom UI for Dropdown */}
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm pointer-events-none">
                <Filter size={12} className="text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">
                  {formatShortCutoff(hostCutoffPeriod)}
                </span>
                <ChevronDown size={12} className="text-slate-400 shrink-0 ml-0.5" />
              </div>

              {/* Invisible Native Select */}
              <select
                value={hostCutoffPeriod}
                onChange={(e) => setHostCutoffPeriod(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none"
              >
                {availableCutoffMonths.map((period) => (
                  <option key={period} value={period}>
                    {formatShortCutoff(period)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Kehadiran</span>
              </div>
              <div className="z-10 mt-2">
                <div className="text-3xl font-black text-indigo-600 leading-none">{kalenderStats.hadir}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Hari</div>
              </div>
              <CalendarIcon className="absolute -bottom-3 -right-3 w-16 h-16 text-indigo-50/60 rotate-[-15deg] pointer-events-none" strokeWidth={1} />
            </div>
            
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-xl bg-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm shadow-fuchsia-500/20">
                  <X className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Tidak Hadir</span>
              </div>
              <div className="z-10 mt-2">
                <div className="text-3xl font-black text-fuchsia-500 leading-none">{kalenderStats.tidakHadir}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Hari</div>
              </div>
              <X className="absolute -bottom-3 -right-3 w-16 h-16 text-fuchsia-50/60 rotate-[-15deg] pointer-events-none" strokeWidth={1} />
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/20">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Telat</span>
              </div>
              <div className="z-10 mt-2">
                <div className="text-3xl font-black text-amber-500 leading-none">{kalenderStats.telat}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Hari</div>
              </div>
              <Clock className="absolute -bottom-3 -right-3 w-16 h-16 text-amber-50/60 rotate-[-15deg] pointer-events-none" strokeWidth={1} />
            </div>
          </div>

          {/* Kalender Card */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-5 relative">
            <h3 className="text-[15px] font-bold text-slate-800 mb-5">Kalender Kerja Host</h3>
            
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-colors">
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-[15px] text-slate-800">
                {new Date(hostCalendarYear, hostCalendarMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleNextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-colors">
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    setHostCalendarMonth(today.getMonth());
                    setHostCalendarYear(today.getFullYear());
                    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                  }} 
                  className="px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-3 justify-items-center mb-6">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
                <div key={day} className="text-[11px] font-medium text-slate-400 w-10 text-center mb-2">{day}</div>
              ))}
              {renderFullCalendarDays()}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-slate-100/80">
              {uniqueBrands.length > 0 ? (
                uniqueBrands.map(brand => (
                  <div key={brand} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getBrandColor(brand).solid}`} />
                    <span className="text-[10px] font-medium text-slate-500">{brand}</span>
                  </div>
                ))
              ) : (
                <span className="text-[10px] font-medium text-slate-400">Belum ada brand</span>
              )}
            </div>
          </div>

          {/* Jadwal Berikutnya Card */}
          {(() => {
            const todayStr = (() => {
              const d = new Date();
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            })();
            const isToday = selectedDate === todayStr;
            const isPast = selectedDate < todayStr;
            const selectedSchedule = hostSchedules.find(s => s.date === selectedDate);
            const selectedDateObj = new Date(selectedDate);
            const dateLabel = isToday ? 'Hari Ini' : (new Date(selectedDateObj.getTime() - 86400000).toISOString().split('T')[0] === todayStr ? 'Besok' : '');
            const dateFormatted = selectedDateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
            
            if (!selectedSchedule) {
              return (
                <div className="bg-indigo-50/40 rounded-3xl p-5 border border-indigo-100 text-center py-8">
                   <CalendarIcon className="w-10 h-10 text-indigo-200 mx-auto mb-2" />
                   <div className="font-bold text-slate-600 text-sm">Tidak Ada Jadwal</div>
                   <div className="text-[11px] text-slate-500 mt-1">{dateFormatted}</div>
                </div>
              );
            }

            return (
              <div className="bg-[#f5f7fa] rounded-3xl p-4 border border-indigo-50 shadow-sm relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                      <CalendarIcon className="w-4.5 h-4.5" strokeWidth={2.5} />
                    </div>
                    <div className="font-bold text-slate-800 text-[15px]">{isPast ? 'Detail Jadwal' : 'Jadwal Berikutnya'}</div>
                  </div>
                  <div className="bg-indigo-100/60 px-3 py-1.5 rounded-full">
                    <span className="text-[9px] font-bold text-indigo-600">{dateLabel ? `${dateLabel} • ` : ''}{dateFormatted}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <Home className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Brand</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{selectedSchedule.brandHandled || selectedSchedule.brand}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Platform</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{getSchedulePlatform(selectedSchedule)}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Shift</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{selectedSchedule.timeSlot || selectedSchedule.shift}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Studio</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{selectedSchedule.studio || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* Konten Performance */}
      {activeTab === 'performance' && (
        <div className="mt-2 animate-fadeIn pb-6">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <BarChart2 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Dashboard Performa</h2>
            <p className="text-sm text-slate-500 font-medium mb-6">Pilih brand untuk melihat laporan performa live streaming Anda.</p>
            
            <div className="w-full max-w-sm">
              <div className="relative mb-6">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Cari brand..." 
                  className="w-full bg-[#f8f9fc] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
              
              <div className="flex flex-col gap-3 w-full px-2 mt-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 text-left">Pilih Brand</div>
                {hostClientBrands.map((brand: any) => (
                  <button 
                    key={brand.id}
                    onClick={() => onOpenFullReporting?.(brand.id)}
                    className="bg-white border border-slate-200 hover:border-blue-500 rounded-[20px] p-4 flex items-center justify-between transition-all group hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-xl text-slate-400">{brand.name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-black text-[17px] text-slate-800 group-hover:text-blue-700 block mb-0.5">{brand.name}</span>
                        <span className="text-[11px] font-semibold text-slate-500 block flex items-center gap-1">
                          Lihat Performa Brand
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </button>
                ))}
                {hostClientBrands.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500 font-medium">Tidak ada data brand yang dapat ditampilkan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Konten Akun */}
      {activeTab === 'account' && (
        <div className="mt-2 animate-fadeIn pb-6 space-y-4">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 text-white font-black text-3xl">
              {activeHostObj?.name?.charAt(0).toUpperCase() || "H"}
            </div>
            
            {isEditingProfile ? (
              <div className="w-full max-w-sm space-y-4 mb-6 text-left">
                {profileErrorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap Host</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Kontak / No. WhatsApp</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="Contoh: 08123456789 atau username kontak"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-600">Nama Bank</label>
                    <span className="text-[10px] text-slate-400">Pilih cepat:</span>
                  </div>

                  {/* Quick Bank Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {['BCA', 'BRI', 'BNI', 'Mandiri', 'SeaBank', 'BSI', 'CIMB Niaga', 'Bank Jago', 'Dana'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, bankName: bank })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          profileForm.bankName.toLowerCase() === bank.toLowerCase()
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={profileForm.bankName}
                    onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="Ketik nama bank (contoh: BCA, BRI, SeaBank)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">No. Rekening Bank</label>
                  <input
                    type="text"
                    value={profileForm.bankAccount}
                    onChange={(e) => setProfileForm({ ...profileForm, bankAccount: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl py-3 px-4 text-sm font-black text-slate-800 font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none tracking-wider"
                    placeholder="Contoh: 577801020681501"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    *Nomor rekening ini akan digunakan oleh finance/admin untuk transfer gaji & lembur.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileErrorMsg('');
                    }}
                    disabled={isSavingProfile}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    {isSavingProfile ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{activeHostObj?.name || "Host Name"}</h2>
                <p className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-5">
                  <User size={14} /> Host Live Streaming
                </p>

                {profileSuccessMsg && (
                  <div className="w-full max-w-sm p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2 mb-4 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}
                
                <div className="w-full max-w-sm space-y-3 mb-6 text-left">
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">ID Pegawai</span>
                    <span className="text-sm font-black text-slate-800 font-mono">
                      {activeHostObj?.employeeId || activeHostObj?.employee_id || activeHostObj?.id?.slice(0, 8).toUpperCase() || "-"}
                    </span>
                  </div>

                  {/* Kontak / No HP */}
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">Kontak / No. HP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800 font-mono">
                        {activeHostObj?.phone || <span className="text-xs font-medium text-slate-400 italic">Belum diset</span>}
                      </span>
                      {activeHostObj?.phone && (
                        <button
                          type="button"
                          onClick={() => handleCopy(activeHostObj.phone, 'phone-acc')}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Salin No HP"
                        >
                          {copiedField === 'phone-acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info Rekening */}
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">Info Rekening</span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        {(activeHostObj?.bankName || activeHostObj?.bank_name) ? (
                          <>
                            <span className="text-[13px] font-black text-slate-800 block">
                              {activeHostObj.bankName || activeHostObj.bank_name}
                            </span>
                            <span className="text-[12px] font-bold text-slate-600 font-mono block">
                              {activeHostObj.bankAccount || activeHostObj.bank_account || "-"}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-amber-600 italic">Belum diset</span>
                        )}
                      </div>
                      {(activeHostObj?.bankAccount || activeHostObj?.bank_account) && (
                        <button
                          type="button"
                          onClick={() => handleCopy(activeHostObj.bankAccount || activeHostObj.bank_account, 'bank-acc')}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                          title="Salin No Rekening"
                        >
                          {copiedField === 'bank-acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex flex-col items-start gap-2">
                    <span className="text-sm font-bold text-slate-500">Studio & Brand</span>
                    <div className="text-xs font-black text-slate-800 mb-1">{activeHostObj?.studio || "Tidak Ada Studio"}</div>
                    <div className="flex flex-wrap gap-2">
                      {hostClientBrands.length > 0 ? hostClientBrands.map((b: any) => (
                        <span key={b.id} className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{b.name}</span>
                      )) : (
                        <span className="text-[10px] font-semibold text-slate-400">Belum ada brand</span>
                      )}
                    </div>
                  </div>

                  {activeHostObj?.platforms && activeHostObj.platforms.length > 0 && (
                    <div className="bg-[#f8f9fc] rounded-2xl p-4 flex flex-col items-start gap-2">
                      <span className="text-sm font-bold text-slate-500">Platform Live</span>
                      <div className="flex flex-wrap gap-2">
                        {activeHostObj.platforms.map((p: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                            <Radio size={10} className="text-blue-500" />
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full max-w-sm bg-blue-50 text-blue-600 font-bold py-3.5 rounded-2xl border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Edit3 size={18} />
                  Ubah Kontak & Rekening Bank
                </button>
              </>
            )}
          </div>
          
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 px-2">Pengaturan Perangkat & Akun</h3>
            
            {/* Card Pengaturan Notifikasi HP */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Notifikasi Layar Kunci HP</h4>
                    <p className="text-[11px] text-slate-500">Pemberitahuan jadwal siaran saat aplikasi ditutup</p>
                  </div>
                </div>
                {pushStatus === 'active' ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-extrabold rounded-full text-[10px]">
                    Aktif
                  </span>
                ) : pushStatus === 'denied' ? (
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-700 font-extrabold rounded-full text-[10px]">
                    Diblokir
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 font-extrabold rounded-full text-[10px]">
                    Belum Aktif
                  </span>
                )}
              </div>

              {pushFeedback && (
                <div className="text-xs font-semibold p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                  {pushFeedback}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {pushStatus === 'active' ? (
                  <>
                    <button
                      type="button"
                      disabled={isPushLoading}
                      onClick={handleEnablePushNotification}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {isPushLoading ? 'Memproses...' : 'Kirim Uji Coba'}
                    </button>
                    <button
                      type="button"
                      disabled={isPushLoading}
                      onClick={handleDisablePushNotification}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Nonaktifkan
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isPushLoading}
                    onClick={handleEnablePushNotification}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {isPushLoading ? 'Menghubungkan...' : 'Aktifkan di Perangkat HP Ini'}
                  </button>
                )}
              </div>
            </div>

            {/* Card Pasang Aplikasi ke Layar Utama HP */}
            <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
                  <Download size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-800">Pasang ke Layar Utama HP</h4>
                  <p className="text-[11px] text-slate-500 truncate">Jadikan aplikasi di Home Screen Android / iOS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer shrink-0"
              >
                Pasang
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between bg-rose-50 hover:bg-rose-100 text-rose-600 p-4 rounded-2xl transition-colors font-bold text-[15px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <LogOut size={18} className="text-rose-600" />
                  </div>
                  Keluar dari Akun
                </div>
                <ChevronRight size={18} className="text-rose-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-2 bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc] to-transparent">
        <div className="w-full max-w-[400px] mx-4 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 px-6 py-3 flex items-center justify-between relative">
          
          {/* 1. Beranda */}
          <button 
            onClick={() => setActiveTab('beranda')} 
            className="flex flex-col items-center justify-center gap-1 w-12 group"
          >
            <Home className={`w-[22px] h-[22px] transition-colors ${activeTab === 'beranda' || activeTab === 'rekap' ? 'text-blue-600 fill-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
            <span className={`text-[9px] font-bold ${activeTab === 'beranda' || activeTab === 'rekap' ? 'text-blue-600' : 'text-slate-400'}`}>Beranda</span>
            {(activeTab === 'beranda' || activeTab === 'rekap') && <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full mt-1" />}
          </button>
          
          {/* 2. Jadwal */}
          <button 
            onClick={() => setActiveTab('kalender')} 
            className="flex flex-col items-center justify-center p-2 relative group"
          >
            <CalendarIcon className={`w-[22px] h-[22px] transition-colors ${activeTab === 'kalender' ? 'text-blue-600 fill-blue-600/20' : 'text-slate-400 group-hover:text-blue-500'}`} strokeWidth={1.5} />
            <span className={`text-[9px] font-bold ${activeTab === 'kalender' ? 'text-blue-600' : 'text-slate-400'}`}>Jadwal</span>
            {activeTab === 'kalender' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full mt-1" />}
          </button>

          {/* 3. Center Action: Absen */}
          <button 
            onClick={() => setIsAbsenModalOpen(true)} 
            className="relative -top-5 flex flex-col items-center justify-center group"
          >
            <div className="w-[58px] h-[58px] bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] ring-4 ring-[#f8f9fc] group-hover:scale-105 transition-all duration-300">
              <Fingerprint className="w-[28px] h-[28px]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-1 absolute -bottom-5">Absen</span>
          </button>

          {/* 4. Performa */}
          <button 
            onClick={() => setActiveTab('performance')}
            className="flex flex-col items-center justify-center p-2 relative group"
          >
            <BarChart2 className={`w-[22px] h-[22px] transition-colors ${activeTab === 'performance' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} strokeWidth={1.5} />
            <span className={`text-[9px] font-bold ${activeTab === 'performance' ? 'text-blue-600' : 'text-slate-400'}`}>Performa</span>
            {activeTab === 'performance' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full mt-1" />}
          </button>

          {/* 5. Akun */}
          <button 
            onClick={() => setActiveTab('account')}
            className="flex flex-col items-center justify-center gap-1 w-12 group relative"
          >
            <User className={`w-[22px] h-[22px] transition-colors ${activeTab === 'account' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} strokeWidth={1.5} />
            <span className={`text-[9px] font-bold ${activeTab === 'account' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>Akun</span>
            {activeTab === 'account' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full mt-1" />}
          </button>
        </div>
      </div>

      {/* Absen Bottom Sheet Modal */}
      <AnimatePresence>
        {isAbsenModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAbsenModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] z-[70] shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setIsAbsenModalOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>
              
              <div className="px-6 pb-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 mt-2">
                  <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <ScanLine size={16} /> Absen {hasCheckedInToday ? 'Pulang/Ulang' : 'Masuk'}
                  </div>
                </div>

                <form onSubmit={handleHostAttendanceSubmit}>
                  {hostFormError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 flex items-start gap-2">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <span className="font-medium">{hostFormError}</span>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Brand</label>
                      <CustomSelect
                        value={hostForm.brand}
                        options={brands}
                        onChange={(v: string) => setHostForm({...hostForm, brand: v})}
                        placeholder="Pilih Brand"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Platform</label>
                      <CustomSelect
                        value={hostForm.platform}
                        options={platforms}
                        onChange={(v: string) => setHostForm({...hostForm, platform: v})}
                        placeholder="Pilih Platform"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Shift</label>
                      <CustomSelect
                        value={hostForm.shift}
                        options={shifts.map(s => ({value: s, label: s}))}
                        onChange={(v: string) => setHostForm({...hostForm, shift: v})}
                        placeholder="Pilih Shift"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Studio</label>
                      <CustomSelect
                        value={hostForm.studio}
                        options={studios}
                        onChange={(v: string) => setHostForm({...hostForm, studio: v})}
                        placeholder="Pilih Studio"
                      />
                    </div>

                    {/* Foto Bukti Kehadiran */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>Foto Bukti Kehadiran</span>
                        </span>
                        <span className="text-[11px] text-rose-500 font-bold">*Wajib Foto</span>
                      </label>

                      {/* Hidden file inputs */}
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoFileChange}
                      />

                      {isCompressingPhoto ? (
                        <div className="border border-slate-200 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
                          <Clock className="w-6 h-6 text-blue-600 animate-spin" />
                          <span className="text-xs font-bold text-slate-600">Memproses & mengoptimalkan foto...</span>
                        </div>
                      ) : hostForm.photo ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 group">
                          <img
                            src={hostForm.photo}
                            alt="Bukti Kehadiran"
                            className="w-full h-44 object-cover object-center"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 backdrop-blur-md rounded-xl p-2.5 text-white text-[11px] flex items-center justify-between shadow-lg">
                            <div className="truncate pr-2">
                              <span className="font-bold block truncate text-xs">{activeHostObj?.name || 'Host'}</span>
                              <span className="text-slate-300 font-mono text-[10px]">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => cameraInputRef.current?.click()}
                                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Buka Kamera"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Kamera</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Pilih Galeri"
                              >
                                <Image className="w-3 h-3" />
                                <span>Galeri</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setHostForm((prev: any) => ({ ...prev, photo: '', photoFile: null }))}
                                className="p-1.5 bg-rose-500/80 hover:bg-rose-600 rounded-lg text-white transition-colors cursor-pointer"
                                title="Hapus Foto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 rounded-2xl p-4 text-center transition-all">
                          <div className="flex flex-col items-center justify-center gap-1.5 mb-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                              <Camera className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-700">Foto Selfie / Kehadiran di Studio</p>
                            <p className="text-[11px] text-slate-400 font-medium">Bisa langsung kamera HP atau pilih file galeri</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Buka Kamera</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current?.click()}
                              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all font-bold text-xs cursor-pointer"
                            >
                              <Image className="w-4 h-4 text-slate-500" />
                              <span>Pilih Galeri</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isCompressingPhoto}
                    className="w-full bg-blue-600 text-white font-bold rounded-2xl py-4 mt-6 shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="w-5 h-5" />
                    <span>Absen Sekarang</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Sukses Absen & Pengarah Kirim WhatsApp Group */}
      <AnimatePresence>
        {isWaModalOpen && waModalData && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsWaModalOpen(false);
                setWaModalData(null);
                if (setLastSubmittedAttendanceLog) setLastSubmittedAttendanceLog(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Sheet Content */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 border border-slate-100"
            >
              {/* Green WA Header */}
              <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight">Absen Masuk Database! 🎉</h3>
                    <p className="text-xs text-emerald-100 font-medium">Lanjutkan kirim ke WhatsApp Group Liva</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsWaModalOpen(false);
                    setWaModalData(null);
                    if (setLastSubmittedAttendanceLog) setLastSubmittedAttendanceLog(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                {/* Photo Preview if available */}
                {(waModalData.proofUrl || waModalData.proof_url || hostForm.photo) && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-900">
                    <img
                      src={waModalData.proofUrl || waModalData.proof_url || hostForm.photo}
                      alt="Foto Absen"
                      className="w-full h-44 object-cover object-center"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Foto Berhasil Disimpan</span>
                    </div>
                  </div>
                )}

                {/* Format Pesan WhatsApp Simple */}
                <div className="bg-[#f8f9fc] rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pesan WhatsApp Group
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Format Baru
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold leading-relaxed whitespace-pre-line shadow-2xs font-sans">
                    {generateWaMessage(waModalData)}
                  </div>
                </div>

                {/* Primary Action Button: WhatsApp */}
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/30 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Kirim ke WhatsApp Group Liva</span>
                </button>

                {/* Secondary Actions */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const text = generateWaMessage(waModalData);
                      navigator.clipboard.writeText(text).then(() => {
                        setWaCopied(true);
                        setTimeout(() => setWaCopied(false), 3000);
                      });
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {waCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    <span>{waCopied ? 'Tersalin!' : 'Salin Format Teks'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPhoto}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Unduh Foto</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center font-medium leading-relaxed">
                  Data absensi Anda telah sukses tersimpan di sistem Liva. Tekan tombol hijau di atas untuk membagikan bukti absensi ke WhatsApp Group Liva.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsWaModalOpen(false);
                    setWaModalData(null);
                    if (setLastSubmittedAttendanceLog) setLastSubmittedAttendanceLog(null);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Drawer / Modal Notifikasi PWA Host */}
      <AnimatePresence>
        {isNotificationsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Sheet Content */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Bell className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">Kotak Notifikasi</h3>
                    <p className="text-xs text-indigo-100/90 font-medium">
                      Pemberitahuan resmi siaran & roster
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotificationsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-header Actions (Tandai Semua Dibaca) */}
              <div className="px-5 py-2.5 bg-indigo-50/70 border-b border-indigo-100/60 flex items-center justify-between text-xs shrink-0">
                <span className="font-semibold text-indigo-900">
                  {unreadNotifCount > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      {unreadNotifCount} pesan belum dibaca
                    </span>
                  ) : (
                    'Semua pesan telah dibaca'
                  )}
                </span>
                {unreadNotifCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeHostObj?.id) {
                        setServerNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        hostNotificationsApi.markRead({ hostId: activeHostObj.id }).catch(() => {});
                        onMarkHostNotificationAsRead?.(activeHostObj.id);
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              {/* Web Push HP Status Indicator inside Modal */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700 truncate">
                    Notifikasi Layar Kunci HP:
                  </span>
                  {pushStatus === 'active' ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px] shrink-0">
                      Aktif
                    </span>
                  ) : pushStatus === 'denied' ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[9px] shrink-0">
                      Diblokir
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[9px] shrink-0">
                      Belum Aktif
                    </span>
                  )}
                </div>
                {pushStatus === 'active' ? (
                  <button
                    type="button"
                    disabled={isPushLoading}
                    onClick={handleEnablePushNotification}
                    className="px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {isPushLoading ? 'Menguji...' : 'Tes Bunyi'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPushLoading}
                    onClick={handleEnablePushNotification}
                    className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {isPushLoading ? 'Menghubungkan...' : 'Aktifkan'}
                  </button>
                )}
              </div>

              {/* Notification List Body */}
              <div className="p-4 overflow-y-auto space-y-3 divide-y-0 flex-1">
                {myNotifications.length === 0 ? (
                  <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400 mb-3">
                      <Bell className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 mb-1">Belum Ada Notifikasi</h4>
                    <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
                      Jadwal siaran baru dan pengumuman dari admin akan langsung muncul di sini.
                    </p>
                  </div>
                ) : (
                  myNotifications.map((notif: any) => {
                    const isUnread = !notif.read;
                    const timeAgo = notif.createdAt
                      ? (() => {
                          const diff = Date.now() - new Date(notif.createdAt).getTime();
                          const min = Math.floor(diff / 60000);
                          if (min < 1) return 'Baru saja';
                          if (min < 60) return `${min}m yang lalu`;
                          const hr = Math.floor(min / 60);
                          if (hr < 24) return `${hr} jam yang lalu`;
                          return `${Math.floor(hr / 24)} hari yang lalu`;
                        })()
                      : notif.date || '';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (isUnread && activeHostObj?.id) {
                            setServerNotifications(prev => prev.map(n => n.id === notif.id ? ({ ...n, read: true }) : n));
                            hostNotificationsApi.markRead({ id: notif.id }).catch(() => {});
                            onMarkHostNotificationAsRead?.(activeHostObj.id);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isUnread
                            ? 'bg-gradient-to-br from-indigo-50/70 to-white border-indigo-200/90 shadow-sm'
                            : 'bg-white border-slate-100 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                            )}
                            <h5 className="font-bold text-xs text-slate-800 leading-snug truncate">
                              {notif.title}
                            </h5>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-indigo-200 my-2">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                            <CalendarIcon className="w-3 h-3 text-slate-400" />
                            {notif.date || 'Siaran Host'}
                          </span>

                          {isUnread ? (
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                              Belum Dibaca
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3 text-emerald-500" /> Dibaca
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNotificationsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 font-bold text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL VIEW FOTO ABSEN HOST */}
      {hostPhotoModal && (
        <div
          className="fixed inset-0 z-[250] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-sans"
          onClick={() => setHostPhotoModal(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden animate-scaleUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Foto Kehadiran</h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {hostPhotoModal.brand} • {new Date(hostPhotoModal.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHostPhotoModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer border-0"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 bg-slate-900/5 flex flex-col items-center justify-center min-h-[200px]">
              {hostPhotoImgError ? (
                <div className="py-6 px-4 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200 w-full shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
                    <AlertTriangle size={20} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Foto Belum Tersedia di Database</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[220px] text-center">
                    Data absen ini dibuat sebelum sistem penyimpanan database aktif.
                  </p>
                </div>
              ) : (
                <div className="relative group max-h-[350px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center shadow-inner">
                  <img
                    src={hostPhotoModal.url}
                    alt={`Bukti Absen ${hostPhotoModal.brand}`}
                    className="max-h-[350px] w-auto max-w-full object-contain"
                    onError={() => setHostPhotoImgError(true)}
                  />
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-white text-xs border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">
                Shift: {hostPhotoModal.shift || "-"}
              </span>
              {!hostPhotoImgError && (
                <a
                  href={hostPhotoModal.url}
                  target="_blank"
                  rel="noreferrer"
                  download={`absen_${hostPhotoModal.brand}_${hostPhotoModal.date}.jpg`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Download size={13} /> Unduh
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
