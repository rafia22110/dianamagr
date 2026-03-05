const { chromium } = require('./node_modules/playwright/index.js');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to admin page...');
    await page.goto('http://localhost:3000/admin');

    // We should be redirected to the login page since we are not authenticated
    await page.waitForURL('http://localhost:3000/admin/login');
    console.log('Redirected to login page.');

    await page.screenshot({ path: '/home/jules/verification/login_page.png' });

    // Attempt login with wrong credentials
    console.log('Testing incorrect login...');
    await page.fill('input#username', 'diana');
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for the error message
    await page.waitForSelector('.bg-red-100');
    await page.screenshot({ path: '/home/jules/verification/login_error.png' });
    console.log('Login error displayed.');

    // Attempt login with correct credentials
    console.log('Testing correct login...');
    await page.fill('input#password', 'diana2024'); // Fill correct password
    await page.click('button[type="submit"]');

    // We should be redirected to the admin panel
    await page.waitForURL('http://localhost:3000/admin');
    console.log('Redirected to admin panel.');

    // Wait for the admin panel to load (e.g. check for the logout button)
    await page.waitForSelector('button:has-text("התנתק")');
    await page.screenshot({ path: '/home/jules/verification/admin_panel.png' });
    console.log('Admin panel loaded.');

    // Test logout
    console.log('Testing logout...');
    await page.click('button:has-text("התנתק")');
    await page.waitForURL('http://localhost:3000/admin/login');
    console.log('Logged out successfully.');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
