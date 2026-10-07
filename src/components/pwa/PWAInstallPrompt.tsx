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
  Sparkles,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return (typeof window !== 'undefined' && (window as any).__deferredPwaPrompt) || null;
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isGoogleApp, setIsGoogleApp] = useState(false);
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
    const isGoogleAppBrowser = /gsa\//.test(userAgent);
    const isSafariBrowser =
      /safari/.test(userAgent) &&
      !/chrome|crios|crmo|firefox|fxios|opt|edgios|instagram|tiktok|fban|fbav|gsa\//.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsSafari(isSafariBrowser);
    setIsGoogleApp(isGoogleAppBrowser);

    // Set default active tab based on detected device
    if (isIosDevice) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }

    // Check if early deferredPrompt was caught in index.html head
    if ((window as any).__deferredPwaPrompt) {
      setDeferredPrompt((window as any).__deferredPwaPrompt);
    }

    const handlePromptReady = () => {
      if ((window as any).__deferredPwaPrompt) {
        setDeferredPrompt((window as any).__deferredPwaPrompt);
      }
    };
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__deferredPwaPrompt = e;
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
      (window as any).__deferredPwaPrompt = null;
      setInstallSuccess(true);
      setTimeout(() => setShowModal(false), 2000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install-modal', handleOpenModal);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleBannerInstallClick = async () => {
    const promptObj = deferredPrompt || (window as any).__deferredPwaPrompt;
    if (promptObj) {
      try {
        await promptObj.prompt();
        const choiceResult = await promptObj.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          (window as any).__deferredPwaPrompt = null;
          return;
        }
      } catch (err) {
        console.warn('Install banner prompt error:', err);
      }
    }
    // If prompt is not available or on iOS, open the guide modal
    setShowModal(true);
  };

  const handleDirectInstallAndroid = async () => {
    const promptObj = deferredPrompt || (window as any).__deferredPwaPrompt;
    if (promptObj) {
      setIsInstalling(true);
      setInstallNotice('👉 Pop-up sistem Android terbuka! Silakan tekan tombol "Install" atau "Tambahkan" pada pop-up layar HP Anda.');
      try {
        await promptObj.prompt();
        const choiceResult = await promptObj.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          (window as any).__deferredPwaPrompt = null;
          setInstallNotice('✅ Aplikasi sedang dipasang ke Home Screen Anda!');
          setTimeout(() => {
            setShowModal(false);
          }, 2000);
        } else {
          setInstallNotice('⚠️ Pemasangan dibatalkan di pop-up sistem. Anda dapat menekan tombol ini kembali kapan saja.');
        }
      } catch (err: any) {
        console.error('Direct install prompt error:', err);
        setInstallNotice('Silakan gunakan cara manual: Tekan menu titik tiga (⋮) di kanan atas browser Anda > pilih "Pasang Aplikasi" atau "Tambahkan ke Layar Utama".');
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Deferred prompt unavailable (e.g. non-chromium browser, already installed, or in-app webview)
      setInstallNotice('Browser HP Anda memerlukan konfirmasi manual: Tekan menu titik tiga (⋮) di pojok kanan atas browser > lalu pilih "Pasang Aplikasi" atau "Tambahkan ke Layar Utama".');
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
                    Pasang ke Layar Utama HP
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {activeTab === 'android' ? 'Panduan Android (Chrome / Samsung Browser)' : 'Panduan iPhone & iPad (Safari)'}
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
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 mb-3 shrink-0">
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
                  <strong className="text-sm font-bold">Aplikasi Sedang Dipasang!</strong>
                  <span className="text-[11px] text-emerald-700">
                    Icon Liva Agency kini sudah dibuat di Home Screen HP Anda.
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
                      className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>{isInstalling ? 'Membuka dialog sistem...' : '⚡ Buka Pop-up Pasang Otomatis'}</span>
                    </button>
                    
                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                      Tekan tombol di atas untuk memunculkan dialog konfirmasi resmi dari browser Android Anda.
                    </p>
                  </div>

                  {/* Clarification about OS Security */}
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 rounded-2xl text-[11px] leading-relaxed">
                    <strong className="block font-bold text-indigo-900 mb-0.5">ℹ️ Catatan Penting Sistem Android:</strong>
                    Demi keamanan, sistem Android <strong>tidak mengizinkan</strong> website memasang icon secara diam-diam tanpa persetujuan Anda.<br/>
                    👉 <strong>Wajib tekan tombol "Install" atau "Tambahkan"</strong> pada jendela pop-up sistem Android yang muncul di layar HP Anda.
                  </div>

                  {/* Feedback / Notice */}
                  {installNotice && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-[11px] flex items-start gap-2 leading-relaxed animate-in fade-in">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{installNotice}</span>
                    </div>
                  )}

                  {/* Android Step-by-Step Guide */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                      Atau Pasang Manual Lewat Menu Browser:
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
                  
                  {/* Warning if opened inside Google App on iOS */}
                  {isGoogleApp && (
                    <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-[11px] text-amber-950 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-bold text-amber-900">Anda Membuka di Aplikasi Google (iOS)</strong>
                          <p className="mt-0.5 leading-snug">
                            Aplikasi Google di iPhone <strong>tidak mendukung</strong> pembuatan icon di Home Screen. Sistem Apple hanya mengizinkannya di browser <strong>Safari</strong>.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Link Tersalin! Buka Safari & Paste' : '📋 Salin Link untuk Buka di Safari'}</span>
                      </button>
                    </div>
                  )}

                  {/* Warning if opened inside non-Safari on iOS */}
                  {isIOS && !isSafari && !isGoogleApp && (
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

                  {/* Apple Security Explanation */}
                  <div className="p-3 bg-purple-50/80 border border-purple-200/70 rounded-2xl text-[11px] text-purple-950 leading-relaxed">
                    <strong className="block text-purple-900 font-bold mb-0.5">Mengapa di iPhone tidak bisa otomatis dengan tombol?</strong>
                    Kebijakan keamanan sistem operasi <strong>Apple (iOS)</strong> secara resmi melarang semua website untuk menaruh icon secara diam-diam tanpa persetujuan manual pemilik iPhone.<br/>
                    👉 Pengguna iPhone wajib menekan tombol <strong>Bagikan (Share) 📤</strong> di menu bawah Safari.
                  </div>

                  {/* iOS Step-by-Step Guide */}
                  <div className="space-y-2.5 text-xs text-slate-600 pt-1">
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
                  {isIOS && isSafari && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200/70 rounded-xl text-center text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1.5 animate-bounce">
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Tombol Share [ 📤 ] ada di bilah bawah layar Safari</span>
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
