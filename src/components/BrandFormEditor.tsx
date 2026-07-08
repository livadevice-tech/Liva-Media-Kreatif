import React from "react";
import { X, Briefcase, Plus, Trash2, Check } from "lucide-react";
import type { ClientBrand } from "../types";
import { SearchableHostSelect } from "./admin/HostManagement";

interface BrandFormEditorProps {
  brandFormEditor: any;
  setBrandFormEditor: any;
  clientBrandsApi?: any;
  setClientBrands: any;
  addNotification: any;
  customAlert: any;
  platforms: string[];
  shifts: string[];
  studios: any[];
  hosts: any[];
}

export function BrandFormEditor({
  brandFormEditor,
  setBrandFormEditor,
  clientBrandsApi,
  setClientBrands,
  addNotification,
  customAlert,
  platforms,
  shifts,
  studios,
  hosts
}: BrandFormEditorProps) {
  if (!brandFormEditor) return null;
  return (
                        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-5 relative">
                          <button
                            type="button"
                            onClick={() => setBrandFormEditor(null)}
                            aria-label="Tutup form brand"
                            className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-500" />
                            {brandFormEditor.id
                              ? "Edit Data Brand"
                              : "Tambah Brand Klien"}
                          </h4>
                          <p className="mb-5 text-[11px] font-medium leading-relaxed text-slate-500">
                            Isi data inti brand, jadwal kerja, lalu detail sesi
                            dan akun seller. Susunan dibuat supaya operator
                            lebih cepat cek bagian yang penting.
                          </p>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const fd = new FormData(e.currentTarget);
                              const nameVal = fd.get("name") as string;
                              const defaultUsername = nameVal
                                ? nameVal
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "")
                                : `brand_${Date.now()}`;
                              const enteredUsername = (
                                fd.get("clientUsername") as string
                              )?.trim();

                              const newBrand: ClientBrand = {
                                id: brandFormEditor.id || `cb_${Date.now()}`,
                                name: nameVal,
                                contractStartDate: fd.get(
                                  "contractStartDate",
                                ) as string,
                                contractEndDate: fd.get(
                                  "contractEndDate",
                                ) as string,
                                invoiceDate: fd.get("invoiceDate") as string,
                                monthlyMeetingDate: fd.get(
                                  "monthlyMeetingDate",
                                ) as string,
                                picName: fd.get("picName") as string,
                                picPhone: fd.get("picPhone") as string,
                                sessions: brandFormEditor.sessions || [],
                                accounts: brandFormEditor.accounts || [],
                                clientUsername:
                                  enteredUsername ||
                                  brandFormEditor.clientUsername ||
                                  defaultUsername,
                                clientPassword:
                                  (fd.get("clientPassword") as string) ||
                                  "liva123",
                                logoUrl: brandFormEditor.logoUrl,
                                isActive: brandFormEditor.isActive !== false,
                                dashboardSettings: brandFormEditor.dashboardSettings || { hiddenMetrics: [], hiddenColumns: [] },
                              };

                              try {
                                if (brandFormEditor.id) {
                                  if (typeof clientBrandsApi !== "undefined" && clientBrandsApi.update) {
                                    await clientBrandsApi.update(newBrand.id, newBrand);
                                  }
                                  setClientBrands((prev) =>
                                    prev.map((b) =>
                                      b.id === newBrand.id ? newBrand : b,
                                    ),
                                  );
                                  addNotification(
                                    "💼 Brand Diperbarui",
                                    `Data brand "${newBrand.name}" berhasil diperbarui oleh admin.`,
                                    "info",
                                    "data_brand",
                                  );
                                } else {
                                  if (typeof clientBrandsApi !== "undefined" && clientBrandsApi.create) {
                                    const res = await clientBrandsApi.create(newBrand);
                                    if (res && res.id && res.id !== newBrand.id) {
                                      newBrand.id = res.id;
                                    }
                                  }
                                  setClientBrands((prev) => [...prev, newBrand]);
                                  addNotification(
                                    "🎉 Brand Klien Baru",
                                    `Brand "${newBrand.name}" baru saja didaftarkan ke sistem Liva Agency.`,
                                    "success",
                                    "data_brand",
                                  );
                                }
                                setBrandFormEditor(null);
                              } catch (error) {
                                console.error("Gagal simpan brand:", error);
                                customAlert("Gagal menyimpan data brand ke server.");
                              }
                            }}
                            className="space-y-4 text-xs"
                          >
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                                <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-700">
                                    Data Brand
                                  </h5>
                                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                                    Identitas dan periode kontrak.
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Upload Logo Brand
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center">
                                      {brandFormEditor.logoUrl ? (
                                        <img src={brandFormEditor.logoUrl} className="h-full w-full object-cover" alt="Logo" />
                                      ) : (
                                        <span className="text-slate-400 text-xs font-bold">RB</span>
                                      )}
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const img = new Image();
                                          img.onload = () => {
                                            const canvas = document.createElement("canvas");
                                            let w = img.width;
                                            let h = img.height;
                                            const maxDim = 150;
                                            if (w > maxDim || h > maxDim) {
                                              if (w > h) {
                                                h = Math.round((h * maxDim) / w);
                                                w = maxDim;
                                              } else {
                                                w = Math.round((w * maxDim) / h);
                                                h = maxDim;
                                              }
                                            }
                                            canvas.width = w;
                                            canvas.height = h;
                                            const ctx = canvas.getContext("2d");
                                            if (ctx) {
                                              ctx.drawImage(img, 0, 0, w, h);
                                              const base64 = canvas.toDataURL("image/jpeg", 0.8);
                                              setBrandFormEditor(prev => prev ? { ...prev, logoUrl: base64 } : null);
                                            }
                                          };
                                          img.src = event.target?.result as string;
                                        };
                                        reader.readAsDataURL(file);
                                      }}
                                      className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Nama Brand
                                  </label>
                                  <input
                                    required
                                    name="name"
                                    defaultValue={brandFormEditor.name}
                                    type="text"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Start Kontrak
                                  </label>
                                  <input
                                    name="contractStartDate"
                                    defaultValue={
                                      brandFormEditor.contractStartDate ||
                                      new Date().toISOString().split("T")[0]
                                    }
                                    type="date"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    End Kontrak
                                  </label>
                                  <input
                                    name="contractEndDate"
                                    defaultValue={
                                      brandFormEditor.contractEndDate ||
                                      new Date().toISOString().split("T")[0]
                                    }
                                    type="date"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Status Brand
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setBrandFormEditor((prev) => prev ? { ...prev, isActive: !(prev.isActive !== false) } : prev)}
                                    className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border font-bold text-xs transition-all w-full justify-between ${
                                      brandFormEditor.isActive !== false
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : "bg-rose-50 border-rose-200 text-rose-800"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${brandFormEditor.isActive !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`}></span>
                                      {brandFormEditor.isActive !== false ? "Aktif" : "Tidak Aktif"}
                                    </span>
                                    <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${brandFormEditor.isActive !== false ? "bg-emerald-500" : "bg-slate-300"}`}>
                                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${brandFormEditor.isActive !== false ? "translate-x-4" : "translate-x-1"}`}></span>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                                <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-700">
                                    Jadwal & Akses
                                  </h5>
                                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                                    Tanggal penagihan, meeting, dan kredensial portal.
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Tanggal Invoice (Setiap Bulan)
                                  </label>
                                  <input
                                    name="invoiceDate"
                                    defaultValue={brandFormEditor.invoiceDate}
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="Contoh: 5"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Tgl Monthly Meeting (Setiap Bulan)
                                  </label>
                                  <input
                                    name="monthlyMeetingDate"
                                    defaultValue={
                                      brandFormEditor.monthlyMeetingDate
                                    }
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="Contoh: 10"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Username Portal Klien
                                  </label>
                                  <input
                                    name="clientUsername"
                                    defaultValue={brandFormEditor.clientUsername}
                                    type="text"
                                    placeholder="Kosongkan utk default (huruf kecil)"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-indigo-900 font-black uppercase text-[10px] tracking-wider mb-1.5">
                                    Password Portal Klien
                                  </label>
                                  <input
                                    name="clientPassword"
                                    defaultValue={
                                      brandFormEditor.clientPassword || "liva123"
                                    }
                                    type="text"
                                    placeholder="Default: liva123"
                                    className="w-full bg-indigo-50/30 border border-indigo-100/80 rounded-xl px-4 py-3 text-xs font-bold text-indigo-950 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-indigo-300 shadow-[0_2px_10px_rgba(79,70,229,0.03)]"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                              <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-2">
                                <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-700">
                                  Detail Sesi (Platform, Shift, Studio, Host)
                                  </h5>
                                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                                    Setiap sesi live brand yang aktif.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBrandFormEditor((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            sessions: [
                                              ...(prev.sessions || []),
                                              {
                                                id: `s_${Date.now()}`,
                                                platform: platforms[0] || "",
                                                shift: shifts[0] || "",
                                                studio: studios[0]?.name || "",
                                                host: "",
                                              },
                                            ],
                                          }
                                        : prev,
                                    );
                                  }}
                                  className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 border-0 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3 h-3" /> Tambah Sesi
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(brandFormEditor.sessions || []).map(
                                  (sess, idx) => (
                                    <div
                                      key={sess.id}
                                      className="flex flex-col xl:flex-row items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100"
                                    >
                                      <select
                                        value={sess.platform}
                                        onChange={(e) =>
                                          setBrandFormEditor((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  sessions: prev.sessions?.map(
                                                    (s, i) =>
                                                      i === idx
                                                        ? {
                                                            ...s,
                                                            platform:
                                                              e.target.value,
                                                          }
                                                        : s,
                                                  ),
                                                }
                                              : prev,
                                          )
                                        }
                                        className="w-full xl:w-[140px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                      >
                                        {platforms.map((p, i) => (
                                          <option key={p + "_" + i} value={p}>
                                            {p}
                                          </option>
                                        ))}
                                      </select>
                                      <select
                                        value={sess.shift}
                                        onChange={(e) =>
                                          setBrandFormEditor((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  sessions: prev.sessions?.map(
                                                    (s, i) =>
                                                      i === idx
                                                        ? {
                                                            ...s,
                                                            shift:
                                                              e.target.value,
                                                          }
                                                        : s,
                                                  ),
                                                }
                                              : prev,
                                          )
                                        }
                                        className="w-full xl:flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                      >
                                        {shifts.map((sh, i) => (
                                          <option key={sh + "_" + i} value={sh}>
                                            {sh}
                                          </option>
                                        ))}
                                      </select>
                                      <select
                                        value={sess.studio || ""}
                                        onChange={(e) =>
                                          setBrandFormEditor((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  sessions: prev.sessions?.map(
                                                    (s, i) =>
                                                      i === idx
                                                        ? {
                                                            ...s,
                                                            studio:
                                                              e.target.value,
                                                          }
                                                        : s,
                                                  ),
                                                }
                                              : prev,
                                          )
                                        }
                                        className="w-full xl:w-[180px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                      >
                                        <option value="">
                                          Pilih Studio...
                                        </option>
                                        {studios.map((st, i) => (
                                          <option
                                            key={st.id + "_" + i}
                                            value={st.name}
                                          >
                                            {st.name} - {st.location}
                                          </option>
                                        ))}
                                      </select>
                                      <SearchableHostSelect
                                        hosts={hosts}
                                        value={sess.host || ""}
                                        valueType="name"
                                        onChange={(hostName) =>
                                          setBrandFormEditor((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  sessions:
                                                    prev.sessions?.map(
                                                      (s, i) =>
                                                        i === idx
                                                          ? {
                                                              ...s,
                                                              host: hostName,
                                                            }
                                                          : s,
                                                    ),
                                                }
                                              : prev,
                                          )
                                        }
                                        className="w-full xl:w-[180px]"
                                        placeholder="Host Reguler / Dedicated (Opsional)..."
                                        triggerClassName="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px] text-left flex items-center justify-between cursor-pointer min-h-[30px]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setBrandFormEditor((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  sessions:
                                                    prev.sessions?.filter(
                                                      (_, i) => i !== idx,
                                                    ),
                                                }
                                              : prev,
                                          )
                                        }
                                        className="w-full xl:w-auto p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-100 cursor-pointer bg-white transition-all flex justify-center items-center"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ),
                                )}
                                {(!brandFormEditor.sessions ||
                                  brandFormEditor.sessions.length === 0) && (
                                  <div className="text-slate-400 font-medium italic text-center py-2 text-[10px]">
                                    Belum ada sesi yang ditambahkan.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                              <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-2">
                                <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-700">
                                  Informasi Akun (Seller Center, dll)
                                  </h5>
                                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                                    Platform seller, username, password, dan PIC OTP.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBrandFormEditor((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            accounts: [
                                              ...(prev.accounts || []),
                                              {
                                                id: `a_${Date.now()}`,
                                                type: platforms[0] || "",
                                                username: "",
                                                password: "",
                                                picOtp: "",
                                              },
                                            ],
                                          }
                                        : prev,
                                    );
                                  }}
                                  className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 border-0 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3 h-3" /> Tambah Akun
                                </button>
                              </div>
                              <div className="space-y-3">
                                {(brandFormEditor.accounts || []).map(
                                  (acc, idx) => (
                                    <div
                                      key={acc.id}
                                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 items-start"
                                    >
                                      <div className="sm:col-span-3">
                                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">
                                          Jenis Akun
                                        </label>
                                        <select
                                          value={acc.type}
                                          onChange={(e) =>
                                            setBrandFormEditor((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    accounts:
                                                      prev.accounts?.map(
                                                        (a, i) =>
                                                          i === idx
                                                            ? {
                                                                ...a,
                                                                type: e.target
                                                                  .value,
                                                              }
                                                            : a,
                                                      ),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none text-slate-700"
                                        >
                                          <option value="">
                                            Pilih Platform...
                                          </option>
                                          {platforms.map((p, i) => (
                                            <option key={p + "_" + i} value={p}>
                                              {p}
                                            </option>
                                          ))}
                                          <option value="Lainnya">
                                            Lainnya
                                          </option>
                                        </select>
                                      </div>
                                      <div className="sm:col-span-3">
                                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">
                                          Username
                                        </label>
                                        <input
                                          type="text"
                                          value={acc.username}
                                          onChange={(e) =>
                                            setBrandFormEditor((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    accounts:
                                                      prev.accounts?.map(
                                                        (a, i) =>
                                                          i === idx
                                                            ? {
                                                                ...a,
                                                                username:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : a,
                                                      ),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-[10px] focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="sm:col-span-3">
                                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">
                                          Password
                                        </label>
                                        <input
                                          type="text"
                                          value={acc.password}
                                          onChange={(e) =>
                                            setBrandFormEditor((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    accounts:
                                                      prev.accounts?.map(
                                                        (a, i) =>
                                                          i === idx
                                                            ? {
                                                                ...a,
                                                                password:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : a,
                                                      ),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-[10px] focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">
                                          PIC OTP
                                        </label>
                                        <input
                                          type="text"
                                          value={acc.picOtp}
                                          onChange={(e) =>
                                            setBrandFormEditor((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    accounts:
                                                      prev.accounts?.map(
                                                        (a, i) =>
                                                          i === idx
                                                            ? {
                                                                ...a,
                                                                picOtp:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : a,
                                                      ),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] focus:border-indigo-500 outline-none"
                                          placeholder="Cth: WA Pak Budi"
                                        />
                                      </div>
                                      <div className="sm:col-span-1 pt-4 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setBrandFormEditor((prev) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    accounts:
                                                      prev.accounts?.filter(
                                                        (_, i) => i !== idx,
                                                      ),
                                                  }
                                                : prev,
                                            )
                                          }
                                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 cursor-pointer bg-white transition-all"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ),
                                )}
                                {(!brandFormEditor.accounts ||
                                  brandFormEditor.accounts.length === 0) && (
                                  <div className="text-slate-400 font-medium italic text-center py-2 text-[10px]">
                                    Belum ada data akun.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                              <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-2">
                                <div>
                                  <h5 className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-700">
                                    Pengaturan Tampilan Dashboard Klien
                                  </h5>
                                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                                    Pilih metrik dan kolom yang ingin disembunyikan di dashboard mitra brand.
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-slate-500 font-bold mb-2 text-[9px] uppercase tracking-wider">
                                    Sembunyikan Metrik (Summary)
                                  </label>
                                  <div className="space-y-2">
                                    {[
                                      { id: "gmv", label: "GMV" },
                                      { id: "orders", label: "Pesanan (Orders)" },
                                      { id: "items_sold", label: "Produk Terjual" },
                                      { id: "est_income", label: "Estimasi Pendapatan" },
                                      { id: "viewers", label: "Total Penonton" },
                                      { id: "engagement", label: "Engagement (Likes/Share/Komen)" },
                                    ].map((metric) => (
                                      <label key={metric.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={brandFormEditor.dashboardSettings?.hiddenMetrics?.includes(metric.id) || false}
                                          onChange={(e) => {
                                            setBrandFormEditor((prev) => {
                                              if (!prev) return prev;
                                              const hiddenMetrics = prev.dashboardSettings?.hiddenMetrics || [];
                                              const newMetrics = e.target.checked
                                                ? [...hiddenMetrics, metric.id]
                                                : hiddenMetrics.filter((id) => id !== metric.id);
                                              return {
                                                ...prev,
                                                dashboardSettings: {
                                                  ...(prev.dashboardSettings || { hiddenColumns: [] }),
                                                  hiddenMetrics: newMetrics,
                                                },
                                              };
                                            });
                                          }}
                                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-semibold text-slate-700">{metric.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-slate-500 font-bold mb-2 text-[9px] uppercase tracking-wider">
                                    Sembunyikan Kolom (Tabel Data Mentah)
                                  </label>
                                  <div className="space-y-2">
                                    {[
                                      { id: "gmv", label: "GMV" },
                                      { id: "orders", label: "Pesanan" },
                                      { id: "items_sold", label: "Item Terjual" },
                                      { id: "est_income", label: "Est. Pendapatan" },
                                      { id: "penonton", label: "Penonton" },
                                      { id: "engagement", label: "Engagement" },
                                    ].map((col) => (
                                      <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={brandFormEditor.dashboardSettings?.hiddenColumns?.includes(col.id) || false}
                                          onChange={(e) => {
                                            setBrandFormEditor((prev) => {
                                              if (!prev) return prev;
                                              const hiddenColumns = prev.dashboardSettings?.hiddenColumns || [];
                                              const newCols = e.target.checked
                                                ? [...hiddenColumns, col.id]
                                                : hiddenColumns.filter((id) => id !== col.id);
                                              return {
                                                ...prev,
                                                dashboardSettings: {
                                                  ...(prev.dashboardSettings || { hiddenMetrics: [] }),
                                                  hiddenColumns: newCols,
                                                },
                                              };
                                            });
                                          }}
                                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                type="submit"
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer border-0 shadow-sm disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" /> Simpan Data Brand
                              </button>
                            </div>
                          </form>
                        </div>  );
}
