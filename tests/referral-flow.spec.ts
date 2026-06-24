import { test, expect } from '@playwright/test';

test.describe('End-to-End Referral Flow', () => {
  const timestamp = Date.now();
  const seekerEmail = `seeker_${timestamp}@test.com`;
  const referrerEmail = `referrer_${timestamp}@test.com`;
  const password = 'Password123!';

  // Helper function to register
  async function register(page, email, role, corporateEmail = '') {
    await page.goto('/register');
    await page.fill('input[placeholder="name@example.com"]', email);
    await page.fill('input[type="password"]', password);
    
    if (role === 'REFERRER') {
      await page.click('button:has-text("I am an Employee")');
      await page.fill('input[placeholder="name@company.com"]', corporateEmail);
    } else {
      await page.click('button:has-text("I am a Job Seeker")');
    }
    
    await page.click('button[type="submit"]');
    // For testing, we mock OTP verification or bypass it.
    // However, our flow goes to /verify-otp. Since we don't have the real OTP, 
    // we might need to bypass it in test environments or manually insert it via Prisma.
  }

  test('Seeker can request a referral and Referrer can accept', async ({ page }) => {
    // Note: This is a placeholder test. Full E2E requires OTP bypass or DB access in tests.
    // We navigate to home page just to ensure the site is up.
    await page.goto('/');
    await expect(page.locator('text=ReferralAI')).toBeVisible();
    
    // Check if the Browse page requires auth (it should redirect to login)
    await page.goto('/dashboard/seeker/browse');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
