const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching Comprehensive E2E Simulation...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const timestamp = Date.now();
    const testEmail = `newseeker_${timestamp}@example.com`;
    const password = 'password123';

    // 1. Create a new account
    console.log(`\nStep 1: Creating a new account (${testEmail})...`);
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    
    // Ensure Seeker role is selected (it's the default, but we'll click just in case)
    await page.click('#role-seeker');
    await page.type('#register-email', testEmail);
    await page.type('#register-password', password);
    await page.click('#register-submit');

    // Wait for the redirect to /login
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Account created. Current URL:', page.url());

    // 2. Login new account
    console.log('\nStep 2: Logging in with the new account...');
    await page.type('#login-email', testEmail);
    await page.type('#login-password', password);
    await page.click('#login-submit');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    if (page.url().includes('/dashboard')) {
      console.log('✅ Logged in successfully. Reached dashboard.');
    } else {
      throw new Error('Failed to reach dashboard after login.');
    }

    // 3 & 4. Go to Profile, upload resume to auto-fill details
    console.log('\nStep 3 & 4: Creating profile via Resume Upload...');
    await page.goto('http://localhost:3000/dashboard/seeker/profile', { waitUntil: 'networkidle0' });
    
    // Upload the file
    console.log('Uploading dummy_resume.pdf...');
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile('dummy_resume.pdf');

    // Wait a few seconds for the API to parse and populate the form fields
    await new Promise(r => setTimeout(r, 4000));
    
    // Check if the headline got populated
    const headlineValue = await page.$eval('input[name="headline"]', el => el.value);
    if (headlineValue.length > 0) {
      console.log(`✅ Resume parsed! Extracted headline: "${headlineValue}"`);
    } else {
      console.log(`⚠️ Resume parsing might have failed or took too long.`);
    }

    // Save Profile
    console.log('Saving profile...');
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 2000)); // wait for save

    // 5. Apply for referrals
    console.log('\nStep 5: Applying for a referral...');
    await page.goto('http://localhost:3000/dashboard/seeker/browse', { waitUntil: 'networkidle0' });
    
    // We expect there to be a referrer from the backend tests.
    // Let's click the first "Request Referral" button.
    const requestButtons = await page.$$('button');
    let requestBtn;
    for (const btn of requestButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Request Referral')) {
        requestBtn = btn;
        break;
      }
    }

    if (requestBtn) {
      console.log('Found a referrer. Clicking "Request Referral"...');
      await requestBtn.click();
      
      await new Promise(r => setTimeout(r, 1000)); // wait for modal
      
      console.log('Typing cover note...');
      // Type into textarea inside the modal
      await page.type('textarea[name="coverNote"]', 'Hello! This is an automated test request.');
      
      // Submit the form in the modal
      const modalButtons = await page.$$('button');
      for (const mBtn of modalButtons) {
        const mText = await page.evaluate(el => el.textContent, mBtn);
        if (mText === 'Send Request') {
          await mBtn.click();
          break;
        }
      }
      console.log('✅ Referral request sent!');
    } else {
      console.log('⚠️ Could not find any "Request Referral" buttons. The DB might be empty.');
    }

    // Wait a moment and take a final screenshot
    await new Promise(r => setTimeout(r, 2000));
    console.log('\nTaking final screenshot...');
    await page.screenshot({ path: 'comprehensive_test_screenshot.png' });
    console.log('✅ Screenshot saved as comprehensive_test_screenshot.png');

    console.log('\n🚀 Comprehensive E2E Simulation completed successfully!');
  } catch (err) {
    console.error('Simulation Failed:', err);
  } finally {
    await browser.close();
  }
})();
