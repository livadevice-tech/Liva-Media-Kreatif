const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const targetContent = `                                {/* FORM PENENTU BRAND & PLATFORM (Selalu terlihat sebagai default tujuan) */}
                                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm mb-6 space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                                    <div>
                                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <Sliders className="w-4 h-4 text-indigo-600" />{" "}
                                        Konfigurasi Brand & Platform Penerima
                                      </h4>
                                      <p className="text-[11px] font-semibold text-slate-400">
                                        Pastikan tujuan data diatur secara benar
                                        sebelum Anda melakukan upload file
                                        Excel/CSV/XLS.
                                      </p>
                                    </div>
                                    <span className="bg-white text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs self-start sm:self-auto flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />{" "}
                                      Auto-Detect Aktif
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        1. Pilih Target Brand Klien
                                      </label>
                                      <select
                                        required
                                        value={saveTargetBrandId}
                                        onChange={(e) =>
                                          setSaveTargetBrandId(e.target.value)
                                        }
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                                      >
                                        <option value="">
                                          -- Pilih Brand Klien --
                                        </option>
                                        {clientBrands.map((b) => (
                                          <option key={b.id} value={b.id}>
                                            {b.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        2. Tentukan Platform Marketplace
                                      </label>
                                      <select
                                        value={saveTargetPlatform}
                                        onChange={(e) =>
                                          setSaveTargetPlatform(e.target.value)
                                        }
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                                      >
                                        <option value="TikTok Live">
                                          TikTok Live
                                        </option>
                                        <option value="Shopee Live">
                                          Shopee Live
                                        </option>
                                        <option value="Tokopedia">
                                          Tokopedia
                                        </option>
                                        <option value="Lazada">Lazada</option>
                                      </select>
                                    </div>
                                  </div>

                                  {autoDetectNotice && (
                                    <div className="bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl text-xs text-indigo-950 font-bold flex items-center gap-2.5 animate-fadeIn">
                                      <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 animate-bounce" />
                                      <div>
                                        <p className="text-indigo-850">
                                          {autoDetectNotice}
                                        </p>
                                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                                          Sistem memetakan file secara otomatis.
                                          Anda tetap dapat mengubah dropdown di
                                          atas secara manual jika tidak sesuai.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {reportingRawData.length === 0 ? (
                                  <div className="space-y-4">
                                    <div
                                      className={\`relative border-2 border-dashed rounded-[24px] p-10 sm:p-14 flex flex-col items-center justify-center text-center transition-all cursor-pointer \${isDragOverReporting ? "border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"}\`}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(true);
                                      }}
                                      onDragLeave={(e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(false);
                                      }}
                                      onDrop={async (e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file)
                                          handleUploadReportingRaw(file);
                                      }}
                                    >
                                      <input
                                        type="file"
                                        id="reporting_upload"
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file)
                                            handleUploadReportingRaw(file);
                                        }}
                                      />
                                      <label
                                        htmlFor="reporting_upload"
                                        className="cursor-pointer flex flex-col items-center justify-center gap-4"
                                      >
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                                          <Upload className="w-10 h-10 text-indigo-500" />
                                        </div>
                                        <div>
                                          <h4 className="text-base font-black text-slate-800">
                                            Upload Raw{" "}
                                            {uploadTargetTab === "engagement"
                                              ? "Engagement & Promotion"
                                              : "Data"}{" "}
                                            {saveTargetPlatform !== "Semua"
                                              ? saveTargetPlatform
                                              : "Marketplace"}
                                          </h4>
                                          <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                                            {uploadTargetTab === "engagement"
                                              ? saveTargetPlatform ===
                                                "Shopee Live"
                                                ? "Tarik & lepas file Export Shopee Live Seller (Analisis Interaksi & Promosi) ke area ini."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "Tarik & lepas file Export TikTok Center (Analisis Interaksi & Promosi) ke area ini."
                                                  : "Tarik & lepas file Export TikTok/Shopee (Interaksi & Promosi) ke area ini, atau klik untuk memilih file."
                                              : saveTargetPlatform ===
                                                  "Shopee Live"
                                                ? "Tarik & lepas file Export Shopee Live Seller (Daftar Sesi) ke area ini."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "Tarik & lepas file Export TikTok Center (Analisis Live) ke area ini."
                                                  : "Tarik & lepas file Export TikTok/Shopee (Excel/CSV) ke area ini, atau klik untuk memilih file."}
                                          </p>
                                          <p className="text-[10px] text-indigo-600 font-mono font-bold mt-2">
                                            {uploadTargetTab === "engagement"
                                              ? saveTargetPlatform ===
                                                "Shopee Live"
                                                ? "💡 File Shopee harus mengandung kolom: Nama Livestream, Suka (Likes), Komentar (Comments), Membagikan (Shares), Voucher Toko Diklaim, Voucher Spesial Live Diklaim, Koin Diklaim."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "💡 File TikTok harus mengandung: Live impressions, New followers, Likes, Shares, Comments."
                                                  : "💡 Tips: Beri nama file yang mengandung nama Brand & Platform Anda (contoh: Laporan_Hanasui_TikTok_Engagement.xlsx) untuk auto-detect otomatis!"
                                              : saveTargetPlatform ===
                                                  "Shopee Live"
                                                ? "💡 File Shopee harus mengandung kolom: Nama Livestream, Durasi Rata-Rata Menonton, Tambah ke Keranjang, Pesanan Dibuat."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "💡 File TikTok harus mengandung: Live impressions, Product clicks, Orders, Gross profit."
                                                  : "💡 Tips: Beri nama file yang mengandung nama Brand & Platform Anda (contoh: Laporan_Hanasui_TikTok.xlsx) untuk auto-detect otomatis!"}
                                          </p>
                                        </div>
                                        <div className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                          Pilih File Excel / CSV
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                                      <div className="flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                          <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-black text-indigo-900">
                                            Data Analytics Berhasil Diproses
                                          </h4>
                                          <p className="text-[10px] sm:text-xs font-semibold text-indigo-700">
                                            {reportingRawData.length} Sesi Live
                                            Terdeteksi
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            if (isSavingReport) return;
                                            setIsUploadModalOpen(false);
                                            setReportingRawData([]);
                                            setAutoDetectNotice("");
                                          }}
                                          className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-xs font-black rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                          Tutup
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReportingRawData([]);
                                            setAutoDetectNotice("");
                                          }}
                                          className="px-4 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-black rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                        >
                                          Reset File
                                        </button>
                                      </div>
                                    </div>

                                    {/* BAR AKSI PENYIMPANAN DATABASE */}
                                    <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                                      <div>
                                        <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                                          <Database className="w-4 h-4 text-emerald-600" />{" "}
                                          Konfirmasi Penyimpanan Database
                                        </h4>
                                        <p className="text-xs font-semibold text-emerald-800 mt-1">
                                          Laporan akan disimpan untuk Brand:{" "}
                                          <strong className="text-emerald-950 font-black">
                                            {clientBrands.find(
                                              (b) => b.id === saveTargetBrandId,
                                            )?.name ||
                                              "(PILIH BRAND DULU DIATAS)"}
                                          </strong>{" "}
                                          | Platform:{" "}
                                          <strong className="text-emerald-950 font-black">
                                            {saveTargetPlatform}
                                          </strong>
                                          .
                                        </p>
                                      </div>
                                      <button
                                        onClick={
                                          handleSaveReportingDataToDatabase
                                        }
                                        disabled={isSavingReport}
                                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-sm transition-all border-0 flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                                      >
                                        {isSavingReport ? (
                                          <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            Sedang Menyimpan Laporan...
                                          </>
                                        ) : (
                                          <>
                                            <Database className="w-3.5 h-3.5" />
                                            Simpan Permanen ke Database Brand
                                          </>
                                        )}
                                      </button>
                                    </div>`;

const replacementContent = `                                {/* CLEAN FORM PENENTU BRAND & PLATFORM */}
                                {reportingRawData.length === 0 ? (
                                  <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand:</span>
                                        <select
                                          required
                                          value={saveTargetBrandId}
                                          onChange={(e) => setSaveTargetBrandId(e.target.value)}
                                          className="w-40 bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700 shadow-sm transition-colors"
                                        >
                                          <option value="">-- Pilih Brand --</option>
                                          {clientBrands.map((b) => (
                                            <option key={b.id} value={b.id}>
                                              {b.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform:</span>
                                        <select
                                          value={saveTargetPlatform}
                                          onChange={(e) => setSaveTargetPlatform(e.target.value)}
                                          className="w-36 bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700 shadow-sm transition-colors"
                                        >
                                          <option value="TikTok Live">TikTok Live</option>
                                          <option value="Shopee Live">Shopee Live</option>
                                          <option value="Tokopedia">Tokopedia</option>
                                          <option value="Lazada">Lazada</option>
                                        </select>
                                      </div>
                                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm" title="Sistem akan otomatis mendeteksi platform dan brand dari nama file.">
                                        <Sparkles className="w-3 h-3 text-indigo-400" />
                                        Auto-Detect
                                      </div>
                                    </div>
                                    
                                    {autoDetectNotice && (
                                      <div className="max-w-md mx-auto bg-indigo-50/50 border border-indigo-100/50 px-3 py-2 rounded-lg text-[11px] text-indigo-700 font-bold flex items-center justify-center gap-2 animate-fadeIn">
                                        <Sparkles className="w-3 h-3 text-indigo-500" />
                                        {autoDetectNotice}
                                      </div>
                                    )}

                                    <div
                                      className={\`relative border-2 border-dashed rounded-[24px] p-10 sm:p-14 flex flex-col items-center justify-center text-center transition-all cursor-pointer \${isDragOverReporting ? "border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"}\`}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(true);
                                      }}
                                      onDragLeave={(e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(false);
                                      }}
                                      onDrop={async (e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file) handleUploadReportingRaw(file);
                                      }}
                                    >
                                      <input
                                        type="file"
                                        id="reporting_upload"
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleUploadReportingRaw(file);
                                        }}
                                      />
                                      <label
                                        htmlFor="reporting_upload"
                                        className="cursor-pointer flex flex-col items-center justify-center gap-4"
                                      >
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 hover:text-indigo-600 transition-colors">
                                          <Upload className="w-8 h-8" />
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-black text-slate-800">
                                            Tarik & Lepas File Export {saveTargetPlatform !== "Semua" ? saveTargetPlatform : "Marketplace"}
                                          </h4>
                                          <p className="text-xs text-slate-500 font-semibold mt-1">
                                            atau klik area ini untuk memilih file Excel/CSV.
                                          </p>
                                          <p className="text-[10px] text-indigo-500 font-bold mt-2 bg-indigo-50/50 inline-block px-2 py-1 rounded-md">
                                            💡 Beri nama file yang mengandung Brand & Platform Anda (contoh: Hanasui_TikTok.xlsx) untuk auto-detect otomatis!
                                          </p>
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    {/* CLEAN HEADER UPLOAD SUCCESS & SIMPAN DATABASE */}
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                                      <div className="flex items-center gap-3 w-full md:w-auto text-left">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 border border-indigo-100">
                                          <Database className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-black text-slate-800">
                                            Review & Simpan Data
                                          </h4>
                                          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                            Brand: <strong className="text-indigo-600">{clientBrands.find((b) => b.id === saveTargetBrandId)?.name || "-"}</strong> • 
                                            Platform: <strong className="text-indigo-600">{saveTargetPlatform}</strong> • 
                                            <strong className="text-emerald-600 ml-1">{reportingRawData.length} Sesi Terdeteksi</strong>
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                                        <button
                                          onClick={() => {
                                            setReportingRawData([]);
                                            setAutoDetectNotice("");
                                          }}
                                          disabled={isSavingReport}
                                          className="px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                                        >
                                          Batalkan
                                        </button>
                                        <button
                                          onClick={handleSaveReportingDataToDatabase}
                                          disabled={isSavingReport}
                                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                                        >
                                          {isSavingReport ? (
                                            <>
                                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                              Menyimpan...
                                            </>
                                          ) : (
                                            <>
                                              <Database className="w-3.5 h-3.5" />
                                              Simpan ke Database
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>`;

if(content.includes(targetContent)) {
  fs.writeFileSync('src/App.tsx', content.replace(targetContent, replacementContent), 'utf8');
  console.log('Successfully replaced');
} else {
  console.log('Target content not found. Check formatting.');
}
