import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Share, 
  PlusSquare, 
  Smartphone, 
  Zap, 
  MoreVertical, 
  Copy, 
  Check, 
  Info, 
  ArrowDown, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  
  // Interactive install state
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [installNotice, setInstallNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed as PWA)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(checkStandalone);

    // Check if dismissed recently (suppress banner for 3 days)
    const dismissedTime = localStorage.getItem('liva_pwa_dismissed');
    if (dismissedTime) {
      const parsedTime = parseInt(dismissedTime, 10);
      if (Date.now() - parsedTime < 3 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // Detect OS & Browser
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    const isSafariBrowser =
      /safari/.test(userAgent) &&
      !/chrome|crios|crmo|firefox|fxios|opt|edgios|instagram|tiktok|fban|fbav/.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsSafari(isSafariBrowser);

    // Set default active tab based on detected device
    if (isIosDevice) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for custom trigger to open this install modal from buttons anywhere in app
    const handleOpenModal = () => {
      setShowModal(true);
    };
    window.addEventListener('open-pwa-install-modal', handleOpenModal);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setInstallSuccess(true);
      setTimeout(() => setShowModal(false), 2000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install-modal', handleOpenModal);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleBannerInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Install banner prompt error:', err);
      }
    }
    // If deferredPrompt is not ready or user is on iOS, open the full guide modal
    setShowModal(true);
  };

  const handleDirectInstallAndroid = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      setInstallNotice(null);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          setTimeout(() => {
            setShowModal(false);
          }, 1800);
        } else {
          setInstallNotice('Pemasangan dibatalkan. Anda dapat menekan tombol ini kembali kapan saja.');
        }
      } catch (err: any) {
        console.error('Direct install prompt error:', err);
        setInstallNotice('Tekan menu titik tiga (⋮) di browser Anda lalu pilih "Pasang Aplikasi".');
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Deferred prompt unavailable (e.g. prompt already used or non-chromium browser)
      setInstallNotice('Browser Android kamu memerlukan konfirmasi via menu: Tekan menu titik tiga (⋮) di pojok kanan atas browser, lalu pilih "Pasang Aplikasi" atau "Tambahkan ke Layar Utama".');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('liva_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Floating Install Banner (Only if not in standalone mode and not dismissed) */}
      {!isStandalone && !isDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-purple-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 flex-shrink-0 shadow-md">
                <img
                  src="/icons/icon-192.png"
                  alt="Liva App"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-white truncate">Pasang Liva Agency</h4>
                <p className="text-xs text-slate-300 truncate">
                  Akses cepat & layar penuh langsung dari HP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleBannerInstallClick}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismissBanner}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Install Guide & 1-Click Action Modal (Android & iOS) */}
      {showModal && (
        <div className="fixed inset-0 z-[130] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-md shrink-0">
                  <img
                    src="/icons/icon-192.png"
                    alt="Liva"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Pasang di Layar Utama HP
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {activeTab === 'android' ? 'Untuk HP Android (Chrome / Samsung Browser)' : 'Untuk iPhone & iPad (Safari)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Segmented Tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 mb-3.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('android');
                  setInstallNotice(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'android'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>🤖 Android</span>
                {isAndroid && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ios');
                  setInstallNotice(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ios'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🍎 iPhone / iPad</span>
                {isIOS && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
              </button>
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="overflow-y-auto space-y-3 custom-scrollbar flex-1 pr-0.5 text-xs">
              
              {/* SUCCESS STATE */}
              {installSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-800 flex flex-col items-center justify-center gap-1 animate-in zoom-in-95">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
                  <strong className="text-sm font-bold">Aplikasi Berhasil Dipasang!</strong>
                  <span className="text-[11px] text-emerald-700">
                    Icon Liva Agency kini sudah ada di Layar Utama HP Anda.
                  </span>
                </div>
              )}

              {/* ================= ANDROID TAB ================= */}
              {activeTab === 'android' && (
                <div className="space-y-3">
                  
                  {/* Direct 1-Click Action Button for Android */}
                  <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl flex flex-col gap-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                        <span className="font-extrabold text-xs text-purple-950">
                          Pasang Otomatis (1-Klik)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[9px] font-extrabold rounded-full uppercase">
                        Android
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDirectInstallAndroid}
                      disabled={isInstalling}
                      className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>{isInstalling ? 'Membuka dialog instalasi...' : '⚡ Pasang Langsung ke Home Screen'}</span>
                    </button>
                    
                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                      Klik tombol di atas untuk memunculkan pop-up instalasi resmi dari sistem Android Anda.
                    </p>
                  </div>

                  {/* Feedback / Notice */}
                  {installNotice && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-[11px] flex items-start gap-2 leading-relaxed">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{installNotice}</span>
                    </div>
                  )}

                  {/* Android Step-by-Step Guide */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                      Panduan Manual di Browser Android:
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                          1
                        </div>
                        <div className="flex-1 text-[11px] text-slate-700 leading-snug">
                          Tekan menu <span className="font-bold text-slate-900">Titik Tiga (⋮)</span>{' '}
                          <MoreVertical className="inline w-3.5 h-3.5 mx-0.5 text-slate-700" /> di pojok kanan atas browser (Chrome / Edge / Samsung Internet).
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                          2
                        </div>
                        <div className="flex-1 text-[11px] text-slate-700 leading-snug">
                          Pilih menu <span className="font-bold text-slate-900">"Pasang Aplikasi"</span> atau <span className="font-bold text-slate-900">"Tambahkan ke Layar Utama" (Add to Home screen)</span>.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                          3
                        </div>
                        <div className="flex-1 text-[11px] text-slate-700 leading-snug">
                          Tekan <span className="font-bold text-slate-900">"Install / Tambah"</span>. Icon aplikasi Liva akan langsung muncul di Home Screen HP Anda layaknya aplikasi Play Store!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= IOS (IPHONE / IPAD) TAB ================= */}
              {activeTab === 'ios' && (
                <div className="space-y-3">
                  
                  {/* Apple Security Notice & Explanation */}
                  <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2.5 leading-relaxed">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-950 font-bold mb-0.5">Khusus iPhone / iPad (Apple iOS):</strong>
                      Demi keamanan privasi, Apple tidak mengizinkan website memasang icon secara otomatis via tombol langsung. Pemasangan dilakukan melalui menu <strong>Bagikan (Share)</strong> Safari di bawah.
                    </div>
                  </div>

                  {/* Warning if opened inside In-App Browser or Non-Safari on iOS */}
                  {isIOS && !isSafari && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-900 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <strong className="block font-bold">Harap buka di browser Safari</strong>
                        <span className="text-[10px] text-rose-700 leading-tight block mt-0.5">
                          Di iPhone, fitur "Add to Home Screen" hanya tersedia di browser Safari bawaan Apple.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[10px] shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                      </button>
                    </div>
                  )}

                  {/* iOS Step-by-Step Guide matching user's reference */}
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                        1
                      </div>
                      <div className="flex-1 text-[11px] leading-snug">
                        Tekan tombol <span className="font-bold text-slate-900">Bagikan (Share)</span>{' '}
                        <Share className="inline w-3.5 h-3.5 mx-0.5 text-blue-600" /> di menu bawah Safari.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                        2
                      </div>
                      <div className="flex-1 text-[11px] leading-snug">
                        Gulir ke bawah lalu pilih{' '}
                        <span className="font-bold text-slate-900">
                          "Tambahkan ke Layar Utama" (Add to Home Screen)
                        </span>{' '}
                        <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-slate-700" />.
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                        3
                      </div>
                      <div className="flex-1 text-[11px] leading-snug">
                        Tekan <span className="font-bold text-slate-900">"Tambah" (Add)</span> di pojok kanan atas. Icon aplikasi akan langsung muncul di Layar Utama iPhone Anda!
                      </div>
                    </div>
                  </div>

                  {/* Pulsing visual cue pointing towards Safari bottom bar */}
                  {isIOS && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200/70 rounded-xl text-center text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1.5 animate-bounce">
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Tombol Share [ 📤 ] ada di bagian bawah layar iPhone</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Action Button */}
            <div className="pt-3 border-t border-slate-100 mt-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer shadow-sm active:scale-98"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
