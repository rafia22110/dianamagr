const { chromium } = require('playwright');

(async () => {
  console.log('--- Testing Playwright from Node ---');
  console.log('HOME:', process.env.HOME);
  console.log('USERPROFILE:', process.env.USERPROFILE);
  
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/admin/login');
    const title = await page.title();
    console.log('Page Title:', title);
    await browser.close();
    console.log('🎉 Playwright working from Node!');
  } catch (err) {
    console.error('❌ Playwright failed from Node:', err.message);
  }
})();
