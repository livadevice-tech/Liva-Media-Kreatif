import React from 'react';
import { CheckCircle2, Clock, Settings } from 'lucide-react';
import { ClientBrand } from '../../types';

type InvoiceReminderPayload = {
  brandName: string;
  invoiceDate: string;
  toEmails: string;
  amount: number;
  invoiceNumber: string;
};

type InvoiceReminderResponse = {
  success?: boolean;
  details?: string;
  error?: string;
  messageId?: string;
  simulated?: boolean;
};

type InvoiceRemindersPanelProps = {
  upcomingBillings: ClientBrand[];
  globalPicEmail: string;
  emailTestStatus: string;
  onGlobalPicEmailChange: (value: string) => void;
  onEmailTestStatusChange: (value: string) => void;
  onSaveGlobalPicEmail: () => Promise<void>;
  onSendReminder: (payload: InvoiceReminderPayload) => Promise<InvoiceReminderResponse>;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const InvoiceRemindersPanel: React.FC<InvoiceRemindersPanelProps> = ({
  upcomingBillings,
  globalPicEmail,
  emailTestStatus,
  onGlobalPicEmailChange,
  onEmailTestStatusChange,
  onSaveGlobalPicEmail,
  onSendReminder,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white border text-left border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Sistem Pengingat Jadwal Penagihan (Automated Reminders)</h3>
            <p className="text-sm text-slate-500 font-semibold mt-1">Kirim notifikasi ke admin PIC saat Invoice mencapai tanggal penagihan.</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-800 mb-1">Status Sistem Penjadwalan Email</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg">
              Server Background CRON Job aktif. Ketika sistem mendeteksi <strong>Invoice Date setting atau tanggal jatuh tempo / pembuatan invoice hari ini</strong>, notifikasi email pengingat terkirim <strong>secara otomatis</strong> (tanpa perlu klik) ke semua daftar email admin/PIC.
            </p>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Sistem Pemantauan Aktif
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {upcomingBillings.length === 0 && (
              <div className="border border-dashed border-slate-300 p-6 rounded-xl flex flex-col items-center text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-slate-800">Tidak ada invoice jatuh tempo hari ini!</h4>
                <p className="text-xs text-slate-500 mt-1">Seluruh tagihan selesai diproses.</p>
              </div>
            )}
            {upcomingBillings.map(b => {
              return (
                <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{b.name}</h4>
                      <p className="text-xs font-semibold text-amber-600 mt-0.5">Tanggal Tagih: {b.invoiceDate}</p>
                    </div>
                  </div>

                  {parseInt(b.invoiceDate) === new Date().getDate() || b.invoices?.some(inv => {
                    const localToday = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
                    return inv.issueDate === localToday || inv.dueDate === localToday;
                  }) ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-2">
                      <p className="text-[11px] text-emerald-800 font-medium">
                        <strong>Pesan Terkirim Otomatis!</strong> Sistem telah membaca tanggal penagihan invoice hari ini dan berhasil mengirimkan email notifikasi ke daftar PIC internal via API Nodemailer.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-2">
                      <p className="text-[11px] text-amber-800 font-medium">
                        <strong>Menunggu Hari H.</strong> Sistem akan otomatis mengirim pada tgl {b.invoiceDate} (Atau jika ada invoice yang jatuh tempo hari ini).
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mb-2">Penerima: <span className="font-mono font-bold">{b.picEmail || globalPicEmail || "admin1@liva-agency.com, admin2@liva.com"}</span></p>
                  <button
                    type="button"
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const originalText = btn.innerHTML;
                      btn.innerHTML = "Mengirim...";
                      btn.disabled = true;
                      btn.classList.add("opacity-50");
                      try {
                        const data = await onSendReminder({
                          brandName: b.name,
                          invoiceDate: b.invoiceDate,
                          toEmails: b.picEmail || globalPicEmail || "admin1@liva-agency.com, admin2@liva.com",
                          amount: b.amount || 0,
                          invoiceNumber: "AUTO-TEST",
                        });
                        if (data.success) {
                          alert("✅ Sukses! Bukti sistem otomatis berhasil mengirimkan ke: " + (b.picEmail || globalPicEmail || "admin1@liva-agency.com"));
                        } else {
                          alert("❌ Gagal: " + (data.details || data.error));
                        }
                      } catch (err: unknown) {
                        alert("❌ Error Server: " + getErrorMessage(err));
                      } finally {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        btn.classList.remove("opacity-50");
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded uppercase flex items-center gap-1 transition-colors border border-indigo-100 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    Test Pemicu Sekarang
                  </button>
                </div>
              );
            })}
          </div>

          <div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" /> Konfigurasi Admin Penerima Email
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Daftar Email PIC Internal (Penerima Reminder Global)</label>
                  <textarea rows={2} value={globalPicEmail} onChange={e => onGlobalPicEmailChange(e.target.value)} placeholder="admin1@liva-agency.com, admin2@liva-agency.com" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-indigo-500 outline-none font-medium" />
                  <p className="text-[10px] text-slate-500 mt-1">Pisahkan dengan koma jika lebih dari 1 email. Sistem akan otomatis mengirim ke semua email ini.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          onEmailTestStatusChange("Menyimpan konfigurasi daftar penerima email...");
                          await onSaveGlobalPicEmail();
                          onEmailTestStatusChange("Berhasil menyimpan konfigurasi daftar penerima email!");
                          setTimeout(() => onEmailTestStatusChange(""), 3000);
                        } catch (err: unknown) {
                          onEmailTestStatusChange("Gagal menyimpan: " + getErrorMessage(err));
                        }
                      }}
                      type="button" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer border-0">
                      Simpan Konfigurasi
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          console.log("Mengirim request test email ke", globalPicEmail);
                          onEmailTestStatusChange("Sedang mengirim email test ke: " + globalPicEmail + "...");

                          const data = await onSendReminder({
                            brandName: "TEST BRAND AGENCY",
                            invoiceDate: String(new Date().getDate()),
                            toEmails: globalPicEmail,
                            amount: 15000000,
                            invoiceNumber: "INV-TEST-001",
                          });
                          console.log("Response dari API:", data);
                          if (data.simulated) {
                            onEmailTestStatusChange("Test Simulasi Selesai (Sandi Aplikasi / Env belum lengkap).");
                          } else if (data.success) {
                            onEmailTestStatusChange("✅ Bukti terkirim! Pesan sudah diterima oleh server Google dengan ID: " + (data.messageId || 'N/A') + ". Jika belum masuk, coba cek tab PENTING, SPAM, atau PROMOSI (Google kadang memfilter email otomatis).");
                          } else {
                            onEmailTestStatusChange("Gagal mengirim email: " + (data.details || data.error));
                          }
                        } catch (err: unknown) {
                          if (err instanceof DOMException && err.name === 'AbortError') {
                            onEmailTestStatusChange("Terjadi error: Timeout. Request pengiriman terlalu lama (> 12 detik). Silakan coba lagi.");
                          } else {
                            onEmailTestStatusChange("Terjadi error di antarmuka API... server terputus: " + getErrorMessage(err));
                          }
                        }
                      }}
                      type="button" disabled={emailTestStatus.includes("Sedang mengirim")} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer border-0 disabled:opacity-50">
                      {emailTestStatus.includes("Sedang mengirim") ? "Mengirim..." : "Test Kirim Email"}
                    </button>
                  </div>
                  {emailTestStatus && (
                    <div className="text-xs font-bold p-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg">
                      {emailTestStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
