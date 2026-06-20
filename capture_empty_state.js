const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const testEmail = `ux_test_${Date.now()}@example.com`;

    // 1. Create a new account
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    await page.type('#register-email', testEmail);
    await page.type('#register-password', 'password123');
    await page.click('#register-submit');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // 2. Login
    await page.type('#login-email', testEmail);
    await page.type('#login-password', 'password123');
    await page.click('#login-submit');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // 3. Go to requests page (should be empty)
    await page.goto('http://localhost:3000/dashboard/seeker/requests', { waitUntil: 'networkidle0' });
    
    // Take screenshot
    await page.screenshot({ path: 'C:\\Users\\Abhijeet.Patil03\\.gemini\\antigravity-ide\\brain\\57ba7824-3697-4d4a-a0d3-9e0051ebe60d\\empty_state_screenshot.png' });
    console.log('✅ Screenshot saved.');
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await browser.close();
  }
})();
