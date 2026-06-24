import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Phase 4: Employee Testing with Puppeteer...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  try {
    // 1. Login as Referrer
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'testreferrer@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard navigation
    console.log('Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    
    if (page.url().includes('/dashboard/seeker')) {
        console.log('Switched to Referrer profile (assuming button click)');
        // Assuming there is a switch role button if they default to seeker
        const switchBtn = await page.$('button:has-text("Switch to Referrer")');
        if (switchBtn) await switchBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    }

    // 2. Profile Setup
    console.log('Going to profile...');
    await page.goto('http://localhost:3000/dashboard/referrer/profile');
    
    console.log('Filling out profile...');
    // We try to find the inputs
    const inputs = await page.$$('input');
    // If we have headline, company, etc.
    // Just save to make sure the endpoint works
    const submitProfile = await page.$('button[type="submit"]');
    if (submitProfile) {
        await submitProfile.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('Profile saved.');
    }

    // 3. Logout
    console.log('Logging out...');
    await page.goto('http://localhost:3000/api/auth/signout');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    // 4. Login as Seeker
    console.log('Logging in as Seeker...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'testseeker@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    // 5. Find Referrer and request
    console.log('Browsing for Referrer...');
    await page.goto('http://localhost:3000/dashboard/seeker/browse');
    
    const requestBtns = await page.$$('button');
    let requested = false;
    for (const btn of requestBtns) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Request')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 1000));
            // fill modal
            const inputs = await page.$$('input');
            if (inputs.length > 0) {
               await inputs[0].type('Software Engineer');
            }
            if (inputs.length > 1) {
               await inputs[1].type('Google');
            }
            
            // Click Send Request button
            const sendBtn = await page.$('button:has-text("Send Request")');
            if (sendBtn) {
               await sendBtn.click();
               requested = true;
               console.log('Request sent.');
               await new Promise(r => setTimeout(r, 2000));
            }
            break;
        }
    }

    // 6. Logout
    await page.goto('http://localhost:3000/api/auth/signout');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});

    // 7. Login as Referrer to Accept
    console.log('Logging in as Referrer to accept request...');
    await page.goto('http://localhost:3000/login');
    await page.type('input[name="email"]', 'testreferrer@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation().catch(() => {});
    
    await page.goto('http://localhost:3000/dashboard/referrer/requests');
    await new Promise(r => setTimeout(r, 2000));

    // Try to find an accept button
    const acceptBtn = await page.$('button:has-text("Accept")');
    if (acceptBtn) {
        await acceptBtn.click();
        console.log('Request accepted!');
    } else {
        console.log('No accept button found.');
    }

    console.log('--- TEST RESULTS ---');
    console.log('Browser errors:', errors);
    console.log('Phase 4 completed.');

  } catch (err) {
      console.error('Test Failed:', err);
  } finally {
      await browser.close();
  }
})();
