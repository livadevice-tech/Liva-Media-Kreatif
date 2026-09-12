import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface SignaturePosition {
  page?: number; // 1-indexed
  xPercent?: number; // 0 to 1 relative to page width
  yPercent?: number; // 0 to 1 relative to page height from top
  widthPercent?: number; // e.g. 0.25 (25% of page width)
  signerName?: string;
  signerRole?: string;
  signedAt?: string;
  withCompanyStamp?: boolean;
}

/**
 * Embeds a signature directly into a PDF document or creates a signed PDF from an image/template.
 * Returns the public URL of the generated signed PDF (e.g. /uploads/assets/signed_xxx.pdf)
 */
export async function stampDocumentWithSignature(params: {
  documentId: string;
  originalFileUrl?: string | null;
  documentTitle: string;
  signatureDataUrl: string;
  position?: SignaturePosition | null;
}): Promise<string | null> {
  const { documentId, originalFileUrl, documentTitle, signatureDataUrl, position } = params;

  try {
    const assetsDir = path.join(process.cwd(), 'uploads', 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const outputFileName = `signed_${documentId}_${timestamp}.pdf`;
    const outputPath = path.join(assetsDir, outputFileName);
    const outputUrl = `/uploads/assets/${outputFileName}`;

    // Clean base64 data URL
    const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const signatureBytes = Buffer.from(base64Data, 'base64');

    let pdfDoc: PDFDocument;

    // Check if original file is an existing local PDF
    let isExistingPdf = false;
    if (originalFileUrl && originalFileUrl.startsWith('/uploads/')) {
      const localFilePath = path.join(process.cwd(), originalFileUrl);
      if (fs.existsSync(localFilePath)) {
        const ext = path.extname(localFilePath).toLowerCase();
        if (ext === '.pdf') {
          try {
            const existingBytes = fs.readFileSync(localFilePath);
            pdfDoc = await PDFDocument.load(existingBytes);
            isExistingPdf = true;
          } catch (e) {
            console.warn('Failed to load existing PDF, creating new signed PDF:', e);
          }
        } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
          // Wrap image into PDF
          try {
            const imgBytes = fs.readFileSync(localFilePath);
            pdfDoc = await PDFDocument.create();
            const img = ext === '.png' ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
            const imgPage = pdfDoc.addPage([img.width, img.height]);
            imgPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            isExistingPdf = true;
          } catch (e) {
            console.warn('Failed to embed image into PDF:', e);
          }
        }
      }
    }

    // If no existing PDF could be loaded, create a formal digital certificate/document PDF
    if (!pdfDoc!) {
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { width, height } = page.getSize();

      // Formal Document Header
      page.drawRectangle({
        x: 40,
        y: height - 120,
        width: width - 80,
        height: 70,
        color: rgb(0.96, 0.97, 1.0),
        borderColor: rgb(0.8, 0.85, 0.98),
        borderWidth: 1,
      });

      page.drawText('LIVA MEDIA KREATIF', {
        x: 60,
        y: height - 80,
        size: 14,
        font: fontBold,
        color: rgb(0.2, 0.25, 0.6),
      });

      page.drawText('SERTIFIKAT & LEMBAR PENGESAHAN DOKUMEN DIGITAL', {
        x: 60,
        y: height - 100,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55),
      });

      // Document Title
      page.drawText('Judul Dokumen / Berkas:', {
        x: 40,
        y: height - 155,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.35, 0.45),
      });

      page.drawText(documentTitle || 'Dokumen Resmi', {
        x: 40,
        y: height - 180,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.12, 0.18),
      });

      // Metadata Box
      const metaY = height - 260;
      page.drawRectangle({
        x: 40,
        y: metaY,
        width: width - 80,
        height: 65,
        color: rgb(0.98, 0.98, 0.99),
        borderColor: rgb(0.9, 0.92, 0.95),
        borderWidth: 1,
      });

      page.drawText(`ID Dokumen: ${documentId}`, { x: 55, y: metaY + 45, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(`Penandatangan: ${position?.signerName || 'Pihak Berwenang'}`, { x: 55, y: metaY + 28, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(`Waktu Tanda Tangan: ${position?.signedAt || new Date().toLocaleString('id-ID')}`, { x: 55, y: metaY + 11, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

      // Legal Note
      page.drawText('Dokumen ini telah diverifikasi dan dibubuhi tanda tangan digital yang sah secara elektronik.', {
        x: 40,
        y: metaY - 30,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Embed Signature Image onto Target Page
    const pages = pdfDoc.getPages();
    const targetPageIndex = Math.max(0, Math.min((position?.page || 1) - 1, pages.length - 1));
    const targetPage = pages[targetPageIndex];
    const { width: pageWidth, height: pageHeight } = targetPage.getSize();

    const signatureImage = await pdfDoc.embedPng(signatureBytes);

    // Calculate Coordinates
    // Default position: Bottom Right of target page if not specified
    const xPercent = position?.xPercent !== undefined ? position.xPercent : 0.62;
    const yPercent = position?.yPercent !== undefined ? position.yPercent : 0.72;
    const widthPercent = position?.widthPercent || 0.26;

    const sigWidth = pageWidth * widthPercent;
    const sigHeight = (sigWidth / signatureImage.width) * signatureImage.height;

    const sigX = Math.max(20, Math.min(pageWidth * xPercent, pageWidth - sigWidth - 20));
    // PDF coordinate (0,0) is bottom-left, while DOM (0,0) is top-left
    const sigY = Math.max(20, Math.min(pageHeight - (pageHeight * yPercent) - sigHeight, pageHeight - sigHeight - 20));

    // Draw Signature
    targetPage.drawImage(signatureImage, {
      x: sigX,
      y: sigY,
      width: sigWidth,
      height: sigHeight,
    });

    // Draw ONLY pure signature image (no underline, no names, no extra stamps)

    // Save stamped PDF
    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    console.log(`[pdfSigner] Successfully stamped PDF at ${outputPath} (${modifiedPdfBytes.length} bytes)`);
    return outputUrl;
  } catch (error) {
    console.error('[pdfSigner] Error stamping PDF document:', error);
    return null;
  }
}
