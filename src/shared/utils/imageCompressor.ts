export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0 (default: 0.72)
}

export interface CompressedImageResult {
  file: File;
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

/**
 * Mengompresi gambar di sisi klien (browser) menggunakan Canvas 2D dengan akselerasi hardware.
 * Mengurangi ukuran gambar hingga 90%+ (sekitar 40KB - 75KB) namun tetap menjaga ketajaman
 * wajah, teks, dan detail absensi untuk efisiensi beban server dan database.
 */
export function compressImage(
  source: File | Blob | string,
  options: CompressImageOptions = {}
): Promise<CompressedImageResult> {
  const maxWidth = options.maxWidth ?? 960;
  const maxHeight = options.maxHeight ?? 960;
  const quality = options.quality ?? 0.72;

  return new Promise((resolve, reject) => {
    let objectUrlToRevoke: string | null = null;
    let isSettled = false;

    // Safety timeout: jika dalam 5 detik browser belum selesai decode, fallback ke file asli
    const safetyTimer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      if (objectUrlToRevoke) {
        try { URL.revokeObjectURL(objectUrlToRevoke); } catch (_) {}
      }
      if (source instanceof File) {
        console.warn('Kompresi gambar melebihi batas waktu, menggunakan file asli.');
        return resolve({ file: source, dataUrl: '', sizeBytes: source.size, width: 0, height: 0 });
      }
      reject(new Error('Batas waktu kompresi foto terlampaui.'));
    }, 6000);

    const cleanup = () => {
      clearTimeout(safetyTimer);
      if (objectUrlToRevoke) {
        try { URL.revokeObjectURL(objectUrlToRevoke); } catch (_) {}
        objectUrlToRevoke = null;
      }
    };

    const img = new window.Image();

    const onLoad = () => {
      if (isSettled) return;
      isSettled = true;
      cleanup();

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          if (source instanceof File) {
            return resolve({ file: source, dataUrl: img.src, sizeBytes: source.size, width: 0, height: 0 });
          }
          return reject(new Error('Dimensi gambar tidak valid.'));
        }

        // Hitung skala proporsional agar aspek rasio terjaga
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (source instanceof File) {
            return resolve({ file: source, dataUrl: img.src, sizeBytes: source.size, width, height });
          }
          return reject(new Error('Canvas 2D context tidak tersedia.'));
        }

        // Smoothing kualitas tinggi agar wajah dan teks tetap tajam (anti-blur)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              const fallbackFile =
                source instanceof File ? source : new File([], 'photo.jpg', { type: 'image/jpeg' });
              return resolve({ file: fallbackFile, dataUrl, sizeBytes: dataUrl.length, width, height });
            }
            const baseName =
              source instanceof File ? source.name.replace(/\.[^/.]+$/, '') : 'attendance';
            const compressedFile = new File([blob], `${baseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve({
              file: compressedFile,
              dataUrl,
              sizeBytes: blob.size,
              width,
              height,
            });
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        if (source instanceof File) {
          return resolve({ file: source, dataUrl: '', sizeBytes: source.size, width: 0, height: 0 });
        }
        reject(err);
      }
    };

    img.onload = onLoad;
    img.onerror = () => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      if (source instanceof File) {
        return resolve({ file: source, dataUrl: '', sizeBytes: source.size, width: 0, height: 0 });
      }
      reject(new Error('Gagal memproses gambar untuk kompresi.'));
    };

    // Gunakan URL.createObjectURL untuk eksekusi instan (< 10ms) tanpa overhead Base64 FileReader
    if (typeof source === 'string') {
      img.src = source;
    } else if (source instanceof Blob || source instanceof File) {
      objectUrlToRevoke = URL.createObjectURL(source);
      img.src = objectUrlToRevoke;
    } else {
      reject(new Error('Format sumber gambar tidak didukung.'));
    }
  });
}
