import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Phase 5 & 6: Security & Admin Testing with Puppeteer...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = {
      unauthenticatedAdminAccess: false,
      nonAdminAccess: false,
      adminAccess: false,
      formValidation: false
  };

  try {
    // 1. Unauthenticated access to /portal-admin
    console.log('Testing unauthenticated access to /portal-admin...');
    await page.goto('http://localhost:3000/portal-admin');
    await new Promise(r => setTimeout(r, 1000));
    if (!page.url().includes('/portal-admin')) {
        results.unauthenticatedAdminAccess = 'Redirected (PASS)';
    } else {
        results.unauthenticatedAdminAccess = 'Allowed (FAIL)';
    }

    // 2. Login as Seeker (Non-Admin)
    console.log('Logging in as Non-Admin...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'testseeker@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    // Try accessing /portal-admin
    console.log('Testing Non-Admin access to /portal-admin...');
    await page.goto('http://localhost:3000/portal-admin');
    await new Promise(r => setTimeout(r, 1000));
    if (!page.url().includes('/portal-admin') || await page.content().then(c => c.includes('Access Denied') || c.includes('404'))) {
        results.nonAdminAccess = 'Denied/Redirected (PASS)';
    } else {
        results.nonAdminAccess = 'Allowed (FAIL)';
    }

    // Logout
    await page.goto('http://localhost:3000/api/auth/signout');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    // 3. Login as Admin
    console.log('Logging in as Admin...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'testadmin@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    console.log('Testing Admin access to /portal-admin...');
    await page.goto('http://localhost:3000/portal-admin');
    await new Promise(r => setTimeout(r, 1000));
    if (page.url().includes('/portal-admin')) {
        results.adminAccess = 'Allowed (PASS)';
    } else {
        results.adminAccess = 'Redirected/Denied (FAIL)';
    }
    
    // Logout
    await page.goto('http://localhost:3000/api/auth/signout');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    // 4. Form Validation Testing
    console.log('Testing Form Validation on /register...');
    await page.goto('http://localhost:3000/register');
    // submit empty form
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 500));
    const content = await page.content();
    if (content.includes('Required') || content.includes('Invalid')) {
        results.formValidation = 'Validation errors shown (PASS)';
    } else {
        results.formValidation = 'No validation errors (FAIL)';
    }

    console.log('--- TEST RESULTS ---');
    console.log(results);
    console.log('Phase 5 & 6 completed.');

  } catch (err) {
      console.error('Test Failed:', err);
  } finally {
      await browser.close();
  }
})();
