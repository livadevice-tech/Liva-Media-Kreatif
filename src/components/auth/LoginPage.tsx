import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Loader2,
  Layers
} from 'lucide-react';
import { UserAccount } from '../../types/app';
import { appApi } from '../../services/appApi';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  dbConnected?: boolean;
  appName?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, dbConnected = true, appName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Mohon masukkan username dan password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await appApi.login({ username: username.trim(), password });
      if (res.success && res.user) {
        if (rememberMe) {
          localStorage.setItem('liva_user_session', JSON.stringify(res.user));
        }
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Login gagal. Periksa kembali akun Anda.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke sistem. Periksa koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.12)] rounded-3xl p-8 sm:p-10 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4 ring-4 ring-indigo-50">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {appName || 'Liva Agency'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Silakan masuk dengan akun yang terdaftar di Manajemen Akun
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3 text-rose-700 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full bg-slate-50/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full bg-slate-50/70 border border-slate-200/90 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 w-3.5 h-3.5"
              />
              <span className="text-xs text-slate-600 font-medium">Ingat Saya</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4f46e5] hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">
            Gunakan akun yang telah didaftarkan pada menu <span className="font-semibold text-indigo-600">Manajemen Akun</span>
          </p>
          <p className="text-[10px] text-slate-400">
            © 2026 Liva Media Kreatif. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
