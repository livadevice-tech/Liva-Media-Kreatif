import { formatIDR } from "./currency";

export interface CopilotFallbackReport {
  name: string;
  countTepatWaktu: number;
  countTerlambat: number;
  countAlpa: number;
  totalHadir: number;
  netSalary: number;
}

export interface CopilotFallbackContext {
  timelyIncentive: number;
  latePenalty: number;
  punctualityRate: number;
  totalLogs: number;
}

const hasKeywords = (input: string, keywords: string[]) =>
  keywords.some((keyword) => input.includes(keyword));

export function getIndonesianMockResponse(
  input: string,
  reports: CopilotFallbackReport[],
  context: CopilotFallbackContext,
): string {
  const lowercase = input.toLowerCase();

  if (hasKeywords(lowercase, ["ringkasan", "performa", "minggu"])) {
    const totalTepatWaktu = reports.reduce(
      (acc, r) => acc + r.countTepatWaktu,
      0,
    );
    const totalTerlambat = reports.reduce(
      (acc, r) => acc + r.countTerlambat,
      0,
    );
    const totalAlpa = reports.reduce((acc, r) => acc + r.countAlpa, 0);
    const totalSesiHadir = totalTepatWaktu + totalTerlambat;
    const onTimeRate =
      totalSesiHadir > 0
        ? Math.round((totalTepatWaktu / totalSesiHadir) * 100)
        : 0;

    return `📊 **Ringkasan Performa Kehadiran Tim Minggu Ini:**

- **Total Sesi Dijalankan**: ${totalSesiHadir} sesi
- **Tepat Waktu**: ${totalTepatWaktu} sesi
- **Terlambat**: ${totalTerlambat} sesi
- **Alpa / Bolos**: ${totalAlpa} sesi
- **Tingkat On-Time (Punctuality)**: **${onTimeRate}%**

✨ **Insight AI**: ${onTimeRate > 80 ? "Tingkat kedisiplinan tim sangat baik! Pertahankan insentif tepat waktu untuk menjaga konsistensi." : "Tingkat keterlambatan perlu diperhatikan. Coba evaluasi beban shift atau terapkan penalti yang lebih tegas."}`;
  }

  if (hasKeywords(lowercase, ["gaji", "hitung", "rekap"])) {
    const topEarner = [...reports].sort(
      (a, b) => b.netSalary - a.netSalary,
    )[0];
    return `📊 **Rekapitulasi Gaji Host (Mode Analisis Offline):**

Berdasarkan parameter operasional yang diatur:

- **Host Terajin / Pendapatan Tertinggi**: **${topEarner?.name}** dengan estimasi gaji bersih **${formatIDR(topEarner?.netSalary || 0)}** (${topEarner?.totalHadir} kali hadir).
- **Total Host Aktif**: ${reports.length} streamer.
- Syarat bonus insentif tepat waktu sebesar **${formatIDR(context.timelyIncentive)}** sangat membantu meningkatkan kerajinan host.

Anda dapat mengunduh berkas laporan dalam menu Operator Dashboard secara langsung!`;
  }

  if (
    hasKeywords(lowercase, ["terlambat", "alpa", "masalah", "absen"])
  ) {
    const toxicHosts = reports.filter(
      (r) => r.countTerlambat > 1 || r.countAlpa > 0,
    );
    let listDetails = "";
    if (toxicHosts.length > 0) {
      listDetails = toxicHosts
        .map(
          (h) =>
            `- **${h.name}**: Terlambat **${h.countTerlambat} kali**, Alpa/Tidak Hadir **${h.countAlpa} kali**. (Kehadiran: ${Math.round((h.totalHadir / (h.totalHadir + h.countAlpa)) * 100)}%)`,
        )
        .join("\n");
    } else {
      listDetails = "Semua host hadir dengan kedisiplinan 100% tepat waktu!";
    }

    return `⚠️ **Laporan Anomali Kehadiran & Kedisiplinan:**

Berikut daftar host yang membutuhkan perhatian khusus:

${listDetails}

*Rekomendasi tindakan*: Kurangi shift pagi bagi host yang sering terlambat atau hubungi langsung untuk restrukturisasi jam tayang. Potongan gaji otomatis ${formatIDR(context.latePenalty)} telah diaplikasikan.`;
  }

  if (hasKeywords(lowercase, ["amanda", "putri"])) {
    const amanda = reports.find((r) => r.name.toLowerCase().includes("amanda"));
    if (amanda) {
      return `**Analisis Performa Host: Amanda Putri**

- **Tepat Waktu**: ${amanda.countTepatWaktu} kali
- **Terlambat**: ${amanda.countTerlambat} kali
- **Alpa / Tidak Hadir**: ${amanda.countAlpa} kali
- **Estimasi Gaji Bersih**: \`${formatIDR(amanda.netSalary)}\`

Amanda sangat konsisten dalam live platform TikTok Live dengan brand kecantikan Wardah & Somethinc. Performa kehadirannya luar biasa di angka **${Math.round((amanda.totalHadir / (amanda.totalHadir + amanda.countAlpa)) * 100)}%**!`;
    }
  }

  return `✨ Menyusul anomali data di Liva Agency, berikut adalah ringkasan absensi host kami:

- Kehadiran Tepat Waktu Tim: **${context.punctualityRate}%**
- Total log tersimpan: **${context.totalLogs}** absensi

Saya merekomendasikan untuk meninjau detail penalti di tab **Kalkulator Operasional** untuk mengonfigurasikan insentif yang optimal bagi para host live streaming! Ada yang ingin ditanyakan lagi?`;
}
