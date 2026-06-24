# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: referral-flow.spec.ts >> Auth Guards & Middleware >> Homepage loads with marketing content
- Location: tests\referral-flow.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | // ─────────────────────────────────────────────────────────────────────────────
  4   | // Auth Guard & Middleware Tests
  5   | // These tests verify routing/access control without needing a logged-in session.
  6   | // ─────────────────────────────────────────────────────────────────────────────
  7   | 
  8   | test.describe('Auth Guards & Middleware', () => {
  9   | 
  10  |   test('Homepage loads with marketing content', async ({ page }) => {
> 11  |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  12  |     await expect(page).toHaveTitle(/ReferralAI/);
  13  |     await expect(page.locator('text=ReferralAI')).toBeVisible();
  14  |   });
  15  | 
  16  |   test('Unauthenticated access to seeker dashboard redirects to login', async ({ page }) => {
  17  |     await page.goto('/dashboard/seeker');
  18  |     await expect(page).toHaveURL(/.*\/login/);
  19  |   });
  20  | 
  21  |   test('Unauthenticated access to referrer dashboard redirects to login', async ({ page }) => {
  22  |     await page.goto('/dashboard/referrer');
  23  |     await expect(page).toHaveURL(/.*\/login/);
  24  |   });
  25  | 
  26  |   test('Unauthenticated access to admin portal redirects to login', async ({ page }) => {
  27  |     await page.goto('/portal-admin');
  28  |     await expect(page).toHaveURL(/.*\/login/);
  29  |   });
  30  | 
  31  |   test('Unauthenticated access to seeker browse redirects to login', async ({ page }) => {
  32  |     await page.goto('/dashboard/seeker/browse');
  33  |     await expect(page).toHaveURL(/.*\/login/);
  34  |   });
  35  | 
  36  |   test('Login page renders correctly', async ({ page }) => {
  37  |     await page.goto('/login');
  38  |     await expect(page).toHaveTitle(/ReferralAI/);
  39  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  40  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  41  |   });
  42  | 
  43  |   test('Register page renders correctly', async ({ page }) => {
  44  |     await page.goto('/register');
  45  |     await expect(page).toHaveTitle(/ReferralAI/);
  46  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  47  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  48  |   });
  49  | 
  50  |   test('Login redirects to callbackUrl after auth', async ({ page }) => {
  51  |     await page.goto('/dashboard/seeker/browse');
  52  |     await expect(page).toHaveURL(/.*\/login\?callbackUrl.*/);
  53  |   });
  54  | 
  55  |   test('Pricing page is publicly accessible', async ({ page }) => {
  56  |     await page.goto('/pricing');
  57  |     await expect(page).not.toHaveURL(/.*\/login/);
  58  |   });
  59  | 
  60  |   test('Privacy page is publicly accessible', async ({ page }) => {
  61  |     await page.goto('/privacy');
  62  |     await expect(page).not.toHaveURL(/.*\/login/);
  63  |   });
  64  | 
  65  |   test('Terms page is publicly accessible', async ({ page }) => {
  66  |     await page.goto('/terms');
  67  |     await expect(page).not.toHaveURL(/.*\/login/);
  68  |   });
  69  | 
  70  | });
  71  | 
  72  | // ─────────────────────────────────────────────────────────────────────────────
  73  | // API Rate Limiting Tests
  74  | // ─────────────────────────────────────────────────────────────────────────────
  75  | 
  76  | test.describe('API Rate Limiting', () => {
  77  | 
  78  |   test('API endpoints return 401 for unauthenticated requests', async ({ request }) => {
  79  |     const res = await request.post('/api/notifications', {
  80  |       data: { title: 'test', message: 'test' },
  81  |     });
  82  |     // Should be 401 Unauthorized, not 500
  83  |     expect([401, 404, 405]).toContain(res.status());
  84  |   });
  85  | 
  86  | });
  87  | 
  88  | // ─────────────────────────────────────────────────────────────────────────────
  89  | // Registration Form Validation Tests
  90  | // ─────────────────────────────────────────────────────────────────────────────
  91  | 
  92  | test.describe('Registration Form Validation', () => {
  93  | 
  94  |   test('Register form rejects invalid email', async ({ page }) => {
  95  |     await page.goto('/register');
  96  |     await page.fill('input[type="email"]', 'not-an-email');
  97  |     await page.fill('input[type="password"]', 'Password123!');
  98  |     await page.click('button[type="submit"]');
  99  |     // Should not navigate away — validation error keeps user on page
  100 |     await expect(page).toHaveURL(/.*\/register/);
  101 |   });
  102 | 
  103 |   test('Register form rejects weak password', async ({ page }) => {
  104 |     await page.goto('/register');
  105 |     await page.fill('input[type="email"]', 'test@example.com');
  106 |     await page.fill('input[type="password"]', '123');
  107 |     await page.click('button[type="submit"]');
  108 |     await expect(page).toHaveURL(/.*\/register/);
  109 |   });
  110 | 
  111 | });
```