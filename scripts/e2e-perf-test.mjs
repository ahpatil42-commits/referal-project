import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Phase 7 & 8: Mobile & Performance Testing...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = {};

  try {
    // Desktop Performance
    console.log('Testing Desktop Load Time...');
    const startDesktop = Date.now();
    await page.goto('http://localhost:3000');
    results.desktopHomeLoad = Date.now() - startDesktop;

    const startReg = Date.now();
    await page.goto('http://localhost:3000/register');
    results.desktopRegLoad = Date.now() - startReg;

    // Mobile Emulation
    console.log('Testing Mobile Layout...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    const startMobile = Date.now();
    await page.goto('http://localhost:3000');
    results.mobileHomeLoad = Date.now() - startMobile;
    
    // Check if mobile menu button is visible on mobile
    await page.waitForSelector('button');
    // evaluate how many buttons are there (looking for hamburger)
    const buttons = await page.$$eval('button', btns => btns.length);
    results.mobileMenuButtons = buttons;

    // Desktop Emulation again
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000');
    
    console.log('--- TEST RESULTS ---');
    console.log(results);

  } catch (err) {
      console.error('Test Failed:', err);
  } finally {
      await browser.close();
  }
})();
