# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: referral-flow.spec.ts >> Auth Guards & Middleware >> Pricing page is publicly accessible
- Location: tests\referral-flow.spec.ts:55:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/pricing", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - heading "Simple pricing for serious job seekers." [level=1] [ref=e4]:
        - text: Simple pricing for
        - text: serious job seekers.
      - paragraph [ref=e5]: Start landing referrals for free. Upgrade to Pro when you are ready to accelerate your search and stand out.
    - generic [ref=e6]:
      - generic [ref=e7] [cursor=pointer]:
        - heading "Starter" [level=3] [ref=e8]:
          - img [ref=e9]
          - text: Starter
        - generic [ref=e11]:
          - generic [ref=e12]: $0
          - generic [ref=e13]: /forever
        - paragraph [ref=e14]: Perfect for getting started and exploring the referral network.
        - link "Get Started Free" [ref=e15]:
          - /url: /register
        - list [ref=e16]:
          - listitem [ref=e17]:
            - img [ref=e18]
            - text: 1 Referral Request per month
          - listitem [ref=e20]:
            - img [ref=e21]
            - text: Basic AI Resume Parsing
          - listitem [ref=e23]:
            - img [ref=e24]
            - text: Standard Support
      - generic [ref=e26] [cursor=pointer]:
        - generic [ref=e27]:
          - img [ref=e28]
          - text: MOST POPULAR
        - heading "Pro" [level=3] [ref=e31]:
          - img [ref=e32]
          - text: Pro
        - generic [ref=e34]:
          - generic [ref=e35]: $19
          - generic [ref=e36]: /month
        - paragraph [ref=e37]: Maximize your chances with priority matching and advanced AI tools.
        - button "Upgrade to Pro" [ref=e39]:
          - text: Upgrade to Pro
          - img [ref=e40]
        - list [ref=e42]:
          - listitem [ref=e43]:
            - img [ref=e44]
            - generic [ref=e46]: 10 Referral Requests per month
          - listitem [ref=e47]:
            - img [ref=e48]
            - text: Priority Placement to Referrers
          - listitem [ref=e50]:
            - img [ref=e51]
            - text: Advanced AI Cover Letter Generator
          - listitem [ref=e53]:
            - img [ref=e54]
            - text: Profile Analytics (See who viewed)
  - region "Notifications alt+T"
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
  11  |     await page.goto('/');
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
> 56  |     await page.goto('/pricing');
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
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
  112 | 
  113 | // ─────────────────────────────────────────────────────────────────────────────
  114 | // Login Form Validation Tests
  115 | // ─────────────────────────────────────────────────────────────────────────────
  116 | 
  117 | test.describe('Login Form Validation', () => {
  118 | 
  119 |   test('Login with invalid credentials shows error', async ({ page }) => {
  120 |     await page.goto('/login');
  121 |     await page.fill('input[type="email"]', 'nonexistent@example.com');
  122 |     await page.fill('input[type="password"]', 'WrongPassword1!');
  123 |     await page.click('button[type="submit"]');
  124 |     // Should remain on login page
  125 |     await expect(page).toHaveURL(/.*\/login/);
  126 |   });
  127 | 
  128 | });
  129 | 
  130 | // ─────────────────────────────────────────────────────────────────────────────
  131 | // SEO & Metadata Tests
  132 | // ─────────────────────────────────────────────────────────────────────────────
  133 | 
  134 | test.describe('SEO & Metadata', () => {
  135 | 
  136 |   test('Homepage has correct meta description', async ({ page }) => {
  137 |     await page.goto('/');
  138 |     const metaDescription = page.locator('meta[name="description"]');
  139 |     await expect(metaDescription).toHaveAttribute('content', /referral/i);
  140 |   });
  141 | 
  142 |   test('Homepage has a single h1 tag', async ({ page }) => {
  143 |     await page.goto('/');
  144 |     const h1Count = await page.locator('h1').count();
  145 |     expect(h1Count).toBeGreaterThanOrEqual(1);
  146 |   });
  147 | 
  148 |   test('Login page has canonical title', async ({ page }) => {
  149 |     await page.goto('/login');
  150 |     await expect(page).toHaveTitle(/ReferralAI/);
  151 |   });
  152 | 
  153 | });
  154 | 
```