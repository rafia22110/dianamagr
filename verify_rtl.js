const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 2500 },
    locale: 'he-IL',
  });
  const page = await context.newPage();

  // 1. Check home page elements
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(1000); // allow animations
  await page.screenshot({ path: '/tmp/homepage_rtl_fix_preview.png', fullPage: true });

  // 2. Set admin session cookie and check admin panel
  await context.addCookies([
    {
      name: 'admin_session',
      value: 'dummy_valid_session_value_not_needed_for_client_render_if_mocked_but_we_will_just_check_login',
      domain: 'localhost',
      path: '/',
    }
  ]);

  await page.goto('http://localhost:3001/admin');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/admin_login_rtl_fix_preview.png' });

  await browser.close();
})();
