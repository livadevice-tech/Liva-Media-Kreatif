import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  X, 
  Server, 
  HardDrive, 
  Clock, 
  Layers, 
  Calendar,
  Check
} from 'lucide-react';
import { projectAppApi, DbTestResult } from '../../services/projectAppApi';

export const DatabaseCheckButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DbTestResult | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runCheck = async () => {
    setLoading(true);
    try {
      const data = await projectAppApi.testDbConnection();
      setResult(data);
      setLastChecked(new Date());
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Gagal menghubungi server database',
        latencyMs: 0,
      });
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Auto-run if never checked yet or previous was failed
    if (!result) {
      runCheck();
    }
  };

  return (
    <>
      {/* Header Action Button */}
      <button
        onClick={handleOpen}
        title="Cek Status Koneksi Database MySQL"
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
          result?.success
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400'
            : result?.success === false
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/50 hover:border-rose-400'
            : 'bg-slate-800/90 border-slate-700/80 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-white'
        }`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        ) : result?.success ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : result?.success === false ? (
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Database className="w-3.5 h-3.5 text-indigo-400" />
        )}

        {/* Status indicator dot */}
        <span className="relative flex h-2 w-2">
          {result?.success && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              loading
                ? 'bg-indigo-400 animate-pulse'
                : result?.success
                ? 'bg-emerald-500'
                : result?.success === false
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          ></span>
        </span>

        <span className="font-medium">
          {loading ? (
            'Mengecek DB...'
          ) : result?.success ? (
            <span className="hidden sm:inline">MySQL OK ({result.latencyMs}ms)</span>
          ) : result?.success === false ? (
            <span className="hidden sm:inline">DB Terputus</span>
          ) : (
            <span className="hidden sm:inline">Cek DB MySQL</span>
          )}
          <span className="sm:hidden">DB</span>
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Status Koneksi Database MySQL</h3>
                  <p className="text-xs text-slate-400">Pemeriksaan realtime koneksi database aplikasi</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Status Banner */}
              {loading && !result ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <p className="text-xs text-slate-300 font-medium">Sedang menghubungi server MySQL...</p>
                </div>
              ) : result ? (
                <>
                  <div
                    className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                      result.success
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    {result.success ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">
                          {result.success ? 'MySQL Terhubung & Siap Digunakan' : 'Koneksi ke MySQL Gagal'}
                        </h4>
                        {result.success && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {result.latencyMs} ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 opacity-90 leading-relaxed break-words">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic Details Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <Server className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium">Host / Port</span>
                      </div>
                      <p className="font-semibold text-slate-200 font-mono">
                        {result.host || 'localhost'}:{result.port || '3306'}
                      </p>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-medium">Database</span>
                      </div>
                      <p className="font-semibold text-slate-200 font-mono truncate" title={result.database}>
                        {result.database || '-'}
                      </p>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium">Kecepatan Respon</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-200">
                          {result.latencyMs} ms
                        </span>
                        {result.success && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            result.latencyMs < 50
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : result.latencyMs < 200
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {result.latencyMs < 50 ? 'Cepat' : result.latencyMs < 200 ? 'Normal' : 'Lambat'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                      <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-medium">Versi Mesin MySQL</span>
                      </div>
                      <p className="font-semibold text-slate-200 font-mono truncate" title={result.version}>
                        {result.version || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Detected Tables */}
                  {result.success && result.tables && result.tables.length > 0 && (
                    <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300">
                          Tabel Terdeteksi ({result.tables.length})
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3" /> Auto-Migrated
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {result.tables.map((tbl) => (
                          <span
                            key={tbl}
                            className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 border border-slate-700 text-slate-300 rounded-md"
                          >
                            {tbl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Checked Timestamp */}
                  {lastChecked && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Terakhir diperiksa: {lastChecked.toLocaleTimeString('id-ID')}</span>
                      </div>
                      {result.serverTime && (
                        <span className="text-slate-500">DB Time: {new Date(result.serverTime).toLocaleTimeString('id-ID')}</span>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={runCheck}
                disabled={loading}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/30 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Menguji...' : 'Uji Koneksi Ulang'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
