const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const svgNormal = `<svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="livaBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b158fc" />
      <stop offset="100%" stop-color="#772bf2" />
    </linearGradient>
  </defs>

  <rect x="5" y="5" width="110" height="110" rx="28" fill="url(#livaBrandGrad)" />

  <path d="M 43 42 C 43 31, 77 31, 77 42" stroke="white" stroke-width="5" stroke-linecap="round" fill="none" />
  <rect x="32" y="42" width="56" height="42" rx="8" fill="white" />
  <path d="M 85 51 Q 88 50, 99 44 Q 104 41, 104 47 L 104 79 Q 104 85, 99 82 Q 88 76, 85 75 Z" fill="white" />
</svg>`;

const svgMaskable = `<svg viewBox="0 0 120 120" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="livaBrandGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b158fc" />
      <stop offset="100%" stop-color="#772bf2" />
    </linearGradient>
  </defs>

  <!-- Full bleed background for adaptive/maskable icon -->
  <rect width="120" height="120" fill="url(#livaBrandGradMask)" />

  <!-- Center glyph scaled to fit within 65% safe zone -->
  <g transform="translate(24, 24) scale(0.6)">
    <path d="M 43 42 C 43 31, 77 31, 77 42" stroke="white" stroke-width="6" stroke-linecap="round" fill="none" />
    <rect x="28" y="42" width="64" height="48" rx="10" fill="white" />
    <path d="M 91 51 Q 95 50, 107 43 Q 112 40, 112 47 L 112 85 Q 112 92, 107 89 Q 95 82, 91 81 Z" fill="white" />
  </g>
</svg>`;

async function generate() {
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgNormal.trim());
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), svgMaskable.trim());

  console.log('Launching Puppeteer to render PNG icons...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  async function renderIcon(svgContent, size, outputPath) {
    const page = await browser.newPage();
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; }
          svg { width: 100%; height: 100%; }
        </style>
      </head>
      <body>${svgContent}</body>
    </html>`;

    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load', timeout: 5000 });
    await page.screenshot({
      path: outputPath,
      omitBackground: true,
      type: 'png'
    });
    await page.close();
    console.log(`Generated: ${outputPath} (${size}x${size})`);
  }

  await renderIcon(svgNormal, 192, path.join(iconsDir, 'icon-192.png'));
  await renderIcon(svgNormal, 512, path.join(iconsDir, 'icon-512.png'));
  await renderIcon(svgNormal, 180, path.join(iconsDir, 'apple-touch-icon.png'));
  await renderIcon(svgMaskable, 512, path.join(iconsDir, 'icon-512-maskable.png'));

  await browser.close();
  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
