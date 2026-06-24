# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: referral-flow.spec.ts >> SEO & Metadata >> Homepage has a single h1 tag
- Location: tests\referral-flow.spec.ts:142:7

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
> 143 |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
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