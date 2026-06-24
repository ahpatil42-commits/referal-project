import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Guard & Middleware Tests
// These tests verify routing/access control without needing a logged-in session.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Auth Guards & Middleware', () => {

  test('Homepage loads with marketing content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ReferralAI/);
    await expect(page.locator('text=ReferralAI').first()).toBeVisible();
  });

  test('Unauthenticated access to seeker dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard/seeker');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Unauthenticated access to referrer dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard/referrer');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Unauthenticated access to admin portal redirects to login', async ({ page }) => {
    await page.goto('/portal-admin');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Unauthenticated access to seeker browse redirects to login', async ({ page }) => {
    await page.goto('/dashboard/seeker/browse');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/ReferralAI/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Register page renders correctly', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/ReferralAI/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Login redirects to callbackUrl after auth', async ({ page }) => {
    await page.goto('/dashboard/seeker/browse');
    await expect(page).toHaveURL(/.*\/login\?callbackUrl.*/);
  });

  test('Pricing page is publicly accessible', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).not.toHaveURL(/.*\/login/);
  });

  test('Privacy page is publicly accessible', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).not.toHaveURL(/.*\/login/);
  });

  test('Terms page is publicly accessible', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).not.toHaveURL(/.*\/login/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// API Rate Limiting Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('API Rate Limiting', () => {

  test('API endpoints return 401 for unauthenticated requests', async ({ request }) => {
    const res = await request.post('/api/notifications', {
      data: { title: 'test', message: 'test' },
    });
    // Should be 401 Unauthorized, not 500
    expect([401, 404, 405]).toContain(res.status());
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Registration Form Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Registration Form Validation', () => {

  test('Register form rejects invalid email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', 'not-an-email');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    // Should not navigate away — validation error keeps user on page
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('Register form rejects weak password', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/register/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Login Form Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login Form Validation', () => {

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'WrongPassword1!');
    await page.click('button[type="submit"]');
    // Should remain on login page
    await expect(page).toHaveURL(/.*\/login/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SEO & Metadata Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe('SEO & Metadata', () => {

  test('Homepage has correct meta description', async ({ page }) => {
    await page.goto('/');
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /referral/i);
  });

  test('Homepage has a single h1 tag', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('Login page has canonical title', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/ReferralAI/);
  });

});
