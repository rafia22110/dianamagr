const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('--- Generating Preview Screenshot ---');
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Homepage
    await page.goto('http://localhost:3002/', { timeout: 90000 });
    const homePath = path.resolve('homepage_preview.png');
    await page.screenshot({ path: homePath, fullPage: true });
    console.log('✅ Homepage screenshot saved to:', homePath);

    // Login page
    await page.goto('http://localhost:3002/admin/login', { timeout: 90000 });
    const loginPath = path.resolve('login_preview.png');
    await page.screenshot({ path: loginPath, fullPage: true });
    console.log('✅ Login page screenshot saved to:', loginPath);

    await browser.close();
    console.log('🎉 Done!');
  } catch (err) {
    console.error('❌ Failed to take screenshot:', err.message);
  }
})();
