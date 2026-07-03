import { Lock } from "lucide-react";

interface AdminPasswordCardProps {
  currentPasswordInput: string;
  newPasswordInput: string;
  confirmPasswordInput: string;
  passwordChangeError: string;
  passwordChangeSuccess: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function AdminPasswordCard({
  currentPasswordInput,
  newPasswordInput,
  confirmPasswordInput,
  passwordChangeError,
  passwordChangeSuccess,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: AdminPasswordCardProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 h-fit">
      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4 text-slate-500" /> Ubah Kata Sandi Admin
      </h4>

      {passwordChangeError && (
        <div className="mb-4 bg-red-50 border border-red-150 text-rose-700 text-xs py-2 px-3 rounded-lg font-bold">
          ⚠️ {passwordChangeError}
        </div>
      )}

      {passwordChangeSuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs py-2 px-3 rounded-lg font-bold">
          ✅ {passwordChangeSuccess}
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Kata Sandi Saat Ini
          </label>
          <input
            type="password"
            required
            value={currentPasswordInput}
            onChange={(e) => onCurrentPasswordChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-rose-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Kata Sandi Baru
          </label>
          <input
            type="password"
            required
            value={newPasswordInput}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            placeholder="Min. 6 karakter"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-rose-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Konfirmasi Kata Sandi Baru
          </label>
          <input
            type="password"
            required
            value={confirmPasswordInput}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Ketik ulang sandi baru"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-rose-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer border-0"
        >
          Perbarui Kata Sandi
        </button>
      </form>
    </div>
  );
}
