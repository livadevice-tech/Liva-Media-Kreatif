const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => {
    errors.push('Page error: ' + err.toString());
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('Console error: ' + msg.text());
    }
  });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  if (errors.length > 0) {
    console.log(errors.join('\n'));
  } else {
    console.log('No errors found on load.');
  }
  await browser.close();
})();
