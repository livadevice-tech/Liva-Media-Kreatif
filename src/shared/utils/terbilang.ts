/**
 * src/shared/utils/terbilang.ts
 * Mengubah nominal angka ke format teks terbilang dalam Bahasa Indonesia.
 * Contoh: 14000000 -> "Empat Belas Juta Rupiah"
 */
export function terbilang(n: number): string {
  if (isNaN(n) || n === 0) return "Nol Rupiah";

  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  function bilang(num: number): string {
    let result = "";
    if (num < 12) {
      result = satuan[num];
    } else if (num < 20) {
      result = bilang(num - 10) + " Belas";
    } else if (num < 100) {
      result = bilang(Math.floor(num / 10)) + " Puluh " + bilang(num % 10);
    } else if (num < 200) {
      result = "Seratus " + bilang(num - 100);
    } else if (num < 1000) {
      result = bilang(Math.floor(num / 100)) + " Ratus " + bilang(num % 100);
    } else if (num < 2000) {
      result = "Seribu " + bilang(num - 1000);
    } else if (num < 1000000) {
      result = bilang(Math.floor(num / 1000)) + " Ribu " + bilang(num % 1000);
    } else if (num < 1000000000) {
      result = bilang(Math.floor(num / 1000000)) + " Juta " + bilang(num % 1000000);
    } else if (num < 1000000000000) {
      result = bilang(Math.floor(num / 1000000000)) + " Miliar " + bilang(num % 1000000000);
    } else if (num < 1000000000000000) {
      result = bilang(Math.floor(num / 1000000000000)) + " Triliun " + bilang(num % 1000000000000);
    }
    return result.trim().replace(/\s+/g, " ");
  }

  const words = bilang(Math.floor(Math.abs(n)));
  return `${words} Rupiah`;
}
