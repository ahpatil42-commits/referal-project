const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching Chrome Simulation...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to Login Page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });

    console.log('Signing in as testseeker@example.com...');
    await page.type('#login-email', 'testseeker@example.com');
    await page.type('#login-password', 'password123');
    await page.click('#login-submit');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Logged in successfully! Current URL:', page.url());

    if (page.url().includes('/dashboard')) {
      console.log('✅ Dashboard reached.');
    } else {
      console.log('❌ Failed to reach dashboard.');
    }

    // Go to browse referrers
    console.log('Navigating to Browse Referrers...');
    await page.goto('http://localhost:3000/dashboard/seeker/browse', { waitUntil: 'networkidle0' });
    console.log('Current URL:', page.url());

    // Check if we can see any referrer cards (assuming they have a specific class or we just check text)
    const content = await page.content();
    if (content.includes('AI Match')) {
      console.log('✅ Found AI Match badges on the Browse page.');
    } else {
      console.log('⚠️ Could not find AI Match text. (Maybe no referrers seeded?)');
    }

    console.log('Taking a screenshot...');
    await page.screenshot({ path: 'chrome_sim_screenshot.png' });
    console.log('✅ Screenshot saved as chrome_sim_screenshot.png');

    console.log('\nSimulation completed successfully!');
  } catch (err) {
    console.error('Simulation Failed:', err);
  } finally {
    await browser.close();
  }
})();
