import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed & running as PWA)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(checkStandalone);

    // Check if dismissed in this session or recently
    const dismissedTime = localStorage.getItem('liva_pwa_dismissed');
    if (dismissedTime) {
      const parsedTime = parseInt(dismissedTime, 10);
      // Suppress for 3 days after user dismisses
      if (Date.now() - parsedTime < 3 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIosDevice);

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      console.log('🎉 Liva Agency PWA berhasil di-install!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('Pengguna menyetujui instalasi PWA');
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSTip(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('liva_pwa_dismissed', Date.now().toString());
  };

  // Do not show if already running in standalone mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show if prompt is ready (Android/Chrome) or on iOS Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Floating Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 flex-shrink-0 shadow-md">
              <img
                src="/icons/icon-192.png"
                alt="Liva App"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">Pasang Liva Agency</h4>
              <p className="text-xs text-slate-300 truncate">
                Akses cepat & layar penuh langsung dari HP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSTip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5">
                  <img
                    src="/icons/icon-192.png"
                    alt="Liva"
                    className="w-full h-full rounded-[10px]"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cara Pasang di iPhone/iPad</h3>
                  <p className="text-[11px] text-slate-500">Gunakan browser Safari</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSTip(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-600">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1">
                  Tekan tombol <span className="font-semibold text-slate-900">Bagikan (Share)</span>{' '}
                  <Share className="inline w-3.5 h-3.5 mx-0.5 text-blue-600" /> di menu bawah Safari.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1">
                  Gulir ke bawah lalu pilih{' '}
                  <span className="font-semibold text-slate-900">
                    "Tambahkan ke Layar Utama" (Add to Home Screen)
                  </span>{' '}
                  <PlusSquare className="inline w-3.5 h-3.5 mx-0.5 text-slate-700" />.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1">
                  Tekan <span className="font-semibold text-slate-900">"Tambah"</span> di pojok kanan atas. Icon aplikasi akan langsung muncul di HP Anda!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSTip(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
