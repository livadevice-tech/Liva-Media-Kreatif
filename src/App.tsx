import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Server, 
  HardDrive, 
  Clock, 
  Layers, 
  Code2, 
  Sliders, 
  Terminal,
  ExternalLink,
  Check
} from 'lucide-react';

interface DbStatus {
  success: boolean;
  message: string;
  latencyMs: number;
  database?: string;
  version?: string;
  serverTime?: string;
  host?: string;
  port?: string;
  tablesCount?: number;
  tables?: string[];
}

export default function App() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const checkDatabase = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch('/api/db-test');
      const data: DbStatus = await res.json();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        success: false,
        message: err.message || 'Gagal menghubungi server backend',
        latencyMs: 0,
      });
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Liva Studio Platform
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Clean Slate v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Fondasi Sistem Baru — Siap Disesuaikan
              </p>
            </div>
          </div>

          {/* Right Action: Database Connection Monitor */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowDbModal(true);
                checkDatabase();
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
                dbStatus?.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : dbStatus?.success === false
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {checkingDb ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : dbStatus?.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="font-medium">
                {checkingDb
                  ? 'Mengecek MySQL...'
                  : dbStatus?.success
                  ? `MySQL Terhubung (${dbStatus.latencyMs}ms)`
                  : 'MySQL Terputus'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome / Canvas Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5" />
              <span>Clean Architecture Ready</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Sistem Bersih & Siap Dirakit Ulang
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Seluruh kode usang telah dibersihkan. Fondasi modern (React 19, Tailwind CSS, Express backend, dan koneksi MySQL Hostinger) sudah aktif dan siap untuk membangun fitur-fitur baru sesuai spesifikasi Anda.
            </p>
          </div>
        </div>

        {/* System Health & Architecture Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Database Status */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Engine</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span>MySQL Hostinger</span>
                {dbStatus?.success && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {dbStatus?.database || 'u287082095_projectliva'} • {dbStatus?.latencyMs || 0}ms latency
              </p>
            </div>
          </div>

          {/* Card 2: Frontend Tech */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frontend Stack</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">React 19 + Vite + Tailwind</div>
              <p className="text-xs text-slate-400 mt-1">
                Kompilasi super cepat, desain ultra-modern, dan nol bloatware.
              </p>
            </div>
          </div>

          {/* Card 3: Backend API */}
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Backend Runtime</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">Node.js Express API</div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Port 3000 • Production Ready
              </p>
            </div>
          </div>
        </div>

        {/* Blueprint Invitation Box */}
        <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-950/10 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Menunggu Rincian Kebutuhan Baru Anda</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Silakan tuliskan spesifikasi fitur, modul apa saja yang dibutuhkan, struktur data, atau alur kerja yang Anda inginkan. Seluruh komponen akan langsung dirakit ke dalam canvas ini!
            </p>
          </div>
        </div>
      </main>

      {/* Database Diagnostic Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Diagnostik Database MySQL</h3>
                  <p className="text-xs text-slate-400">Pemeriksaan realtime koneksi database Hostinger</p>
                </div>
              </div>
              <button
                onClick={() => setShowDbModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                  dbStatus?.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                }`}
              >
                {dbStatus?.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {dbStatus?.success ? 'MySQL Terhubung & Siap Digunakan' : 'Koneksi ke MySQL Gagal'}
                  </h4>
                  <p className="text-xs mt-1 opacity-90">{dbStatus?.message}</p>
                </div>
              </div>

              {dbStatus?.success && (
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium">Database Name</span>
                    <p className="font-semibold text-slate-200 font-mono mt-1">{dbStatus.database}</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium">Latency Respon</span>
                    <p className="font-semibold text-slate-200 font-mono mt-1">{dbStatus.latencyMs} ms</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium">Host / Port</span>
                    <p className="font-semibold text-slate-200 font-mono mt-1">{dbStatus.host || 'localhost'}:{dbStatus.port || '3306'}</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-medium">Versi Mesin</span>
                    <p className="font-semibold text-slate-200 font-mono mt-1 truncate">{dbStatus.version || '-'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={checkDatabase}
                disabled={checkingDb}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin' : ''}`} />
                <span>{checkingDb ? 'Menguji...' : 'Uji Koneksi Ulang'}</span>
              </button>

              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
