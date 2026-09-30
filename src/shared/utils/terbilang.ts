/**
 * src/shared/utils/terbilang.ts
 * Mengubah nominal angka ke format teks terbilang dalam Bahasa Inggris (default) atau Bahasa Indonesia.
 * Contoh: 14000000 -> "Fourteen Million Rupiah"
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousandEn(num: number): string {
  if (num === 0) return "";
  if (num < 20) return ONES[num];
  if (num < 100) {
    const rem = num % 10;
    return TENS[Math.floor(num / 10)] + (rem > 0 ? " " + ONES[rem] : "");
  }
  const rem = num % 100;
  return (
    ONES[Math.floor(num / 100)] +
    " Hundred" +
    (rem > 0 ? " " + convertBelowThousandEn(rem) : "")
  );
}

export function numberToWordsEn(n: number): string {
  if (isNaN(n) || n === 0) return "Zero";
  const abs = Math.floor(Math.abs(n));
  if (abs === 0) return "Zero";

  const scales = [
    { value: 1000000000000, label: "Trillion" },
    { value: 1000000000, label: "Billion" },
    { value: 1000000, label: "Million" },
    { value: 1000, label: "Thousand" },
  ];

  let remaining = abs;
  const parts: string[] = [];

  for (const scale of scales) {
    if (remaining >= scale.value) {
      const count = Math.floor(remaining / scale.value);
      remaining %= scale.value;
      parts.push(convertBelowThousandEn(count) + " " + scale.label);
    }
  }

  if (remaining > 0) {
    parts.push(convertBelowThousandEn(remaining));
  }

  return parts.join(" ").trim().replace(/\s+/g, " ");
}

export function terbilangEn(n: number): string {
  if (isNaN(n) || n === 0) return "Zero Rupiah";
  const words = numberToWordsEn(n);
  return `${words} Rupiah`;
}

export function terbilangId(n: number): string {
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

export function terbilang(n: number, lang: "en" | "id" = "en"): string {
  if (lang === "id") {
    return terbilangId(n);
  }
  return terbilangEn(n);
}
