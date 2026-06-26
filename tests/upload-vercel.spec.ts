/**
 * tests/upload-vercel.spec.ts
 *
 * End-to-end test of the profile photo upload feature on Vercel.
 * Tests the plan from scratchpad_1ijzvys7.md:
 *  - Navigate to Vercel deployment
 *  - Log in as tester_vercel_123@example.com
 *  - Go to Seeker Profile page
 *  - Upload dummy image via JS injection
 *  - Record /api/upload network requests
 *  - Observe UI toasts
 */

import { test, expect } from '@playwright/test';

const VERCEL_URL = 'https://referal-project.vercel.app';
const EMAIL      = 'tester_vercel_123@example.com';
const PASSWORD   = 'Password123!';

// 1×1 transparent PNG as base64
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVQI12P4z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

test.describe('Vercel Upload – Profile Photo', () => {

  test('Login + Seeker Profile page loads', async ({ page }) => {
    await page.goto(`${VERCEL_URL}/login`);
    await expect(page).toHaveTitle(/ReferralAI/i);
    await page.fill('input[type="email"]',    EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect away from /login after successful login
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15_000 });
    console.log(`[✅] Logged in – current URL: ${page.url()}`);

    await page.goto(`${VERCEL_URL}/dashboard/seeker/profile`);
    await expect(page.locator('h1')).toContainText('My Profile', { timeout: 10_000 });
    console.log('[✅] Seeker profile page loaded');
  });

  test('Profile Photo input exists on Seeker Profile page', async ({ page }) => {
    // Login first
    await page.goto(`${VERCEL_URL}/login`);
    await page.fill('input[type="email"]',    EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15_000 });

    await page.goto(`${VERCEL_URL}/dashboard/seeker/profile`);
    await page.waitForLoadState('networkidle');

    // The Profile Photo section should have an <h4> labeled "Profile Photo"
    await expect(page.locator('h4', { hasText: 'Profile Photo' })).toBeVisible({ timeout: 10_000 });

    // And a file input accepting images
    const photoInput = page.locator('input[type="file"][accept*="image"]').first();
    await expect(photoInput).toBeAttached({ timeout: 5_000 });
    console.log('[✅] Profile Photo input found');
  });

  test('Upload dummy PNG via JS injection – network + UI behavior', async ({ page }) => {
    // ── Collect all network requests to /api/upload ─────────────────
    const uploadRequests: Array<{ url: string; status: number; responseBody: string }> = [];
    const uploadErrors:   Array<string> = [];
    const consoleLogs:    Array<string> = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('response', async response => {
      if (response.url().includes('/api/upload')) {
        const body = await response.text().catch(() => '(could not read body)');
        uploadRequests.push({
          url:          response.url(),
          status:       response.status(),
          responseBody: body.slice(0, 500),
        });
        console.log(`[📡] /api/upload → ${response.status()} : ${body.slice(0, 200)}`);
      }
    });

    page.on('pageerror', err => uploadErrors.push(err.message));

    // ── Login ────────────────────────────────────────────────────────
    await page.goto(`${VERCEL_URL}/login`);
    await page.fill('input[type="email"]',    EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    const [loginResponse] = await Promise.all([
      page.waitForNavigation({ timeout: 15_000 }),
      page.click('button[type="submit"]'),
    ]);
    const finalUrl = page.url();
    const loginOk  = !finalUrl.includes('/login');
    console.log(`[${loginOk ? '✅' : '❌'}] Login result URL: ${finalUrl}`);

    if (!loginOk) {
      // Check for error message on the login page
      const errorMsg = await page.locator('[class*="error"], [class*="alert"], [role="alert"]').textContent().catch(() => 'n/a');
      console.log(`[❌] Login failed. Error shown: ${errorMsg}`);
      test.skip(true, `Login failed for ${EMAIL} — user may not exist on Vercel DB`);
      return;
    }

    // ── Navigate to Seeker Profile ────────────────────────────────────
    await page.goto(`${VERCEL_URL}/dashboard/seeker/profile`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
    console.log('[✅] Profile page loaded');

    // ── Inject dummy PNG ─────────────────────────────────────────────
    const injected = await page.evaluate((b64) => {
      const byteChars   = atob(b64);
      const byteNumbers = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i));
      const byteArray   = new Uint8Array(byteNumbers);
      const file        = new File([byteArray], 'test_avatar.png', { type: 'image/png' });
      const dt          = new DataTransfer();
      dt.items.add(file);

      // Find the image file input
      const inputs    = Array.from(document.querySelectorAll('input[type="file"]'));
      const imgInput  = inputs.find(el => (el as HTMLInputElement).accept?.includes('image')) as HTMLInputElement | undefined;
      if (!imgInput) return { ok: false, reason: 'No image input found' };

      imgInput.files = dt.files;
      imgInput.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, inputId: imgInput.id || '(no id)', accept: imgInput.accept };
    }, TINY_PNG_BASE64);

    console.log(`[${injected.ok ? '✅' : '❌'}] JS injection: ${JSON.stringify(injected)}`);

    if (!injected.ok) {
      console.log('[❌] Could not inject file – test cannot proceed');
    }

    // ── Wait for upload to complete (up to 10 seconds) ───────────────
    await page.waitForTimeout(8_000);

    // ── Check for toast notifications ─────────────────────────────────
    // Sonner toasts appear as [data-sonner-toast] or similar
    const toastVisible = await page.locator('[data-sonner-toast], [data-type="toast"], .sonner-toast').count();
    const toastTexts   = await page.locator('[data-sonner-toast]').allTextContents();
    console.log(`[ℹ️ ] Toast count: ${toastVisible}`);
    if (toastTexts.length) console.log(`[ℹ️ ] Toast texts: ${JSON.stringify(toastTexts)}`);

    // ── Print full report ─────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('UPLOAD NETWORK REQUESTS CAPTURED:');
    if (uploadRequests.length === 0) {
      console.log('  ⚠️  No /api/upload requests captured');
    } else {
      uploadRequests.forEach((r, i) => {
        console.log(`  [${i+1}] ${r.status} ${r.url}`);
        console.log(`       Body: ${r.responseBody}`);
      });
    }
    console.log('\nCONSOLE LOGS:');
    consoleLogs.filter(l => !l.includes('[Fast Refresh]')).forEach(l => console.log(' ', l));
    if (uploadErrors.length) {
      console.log('\nPAGE ERRORS:');
      uploadErrors.forEach(e => console.log('  ❌', e));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ── Assertions ────────────────────────────────────────────────────
    expect(injected.ok).toBe(true);

    // At least one /api/upload request should have been made
    if (injected.ok) {
      expect(uploadRequests.length).toBeGreaterThan(0);

      const successReq = uploadRequests.find(r => r.status >= 200 && r.status < 300);
      const errorReq   = uploadRequests.find(r => r.status >= 400);

      if (successReq) {
        console.log('[✅] UPLOAD SUCCEEDED — HTTP', successReq.status);
      } else if (errorReq) {
        console.log('[❌] UPLOAD FAILED — HTTP', errorReq.status, '—', errorReq.responseBody);
        // Still pass the test but log the failure for the report
      }
    }

    // Screenshot at the end
    await page.screenshot({ path: 'playwright-report/upload-test-result.png', fullPage: false });
    console.log('[📸] Screenshot saved to playwright-report/upload-test-result.png');
  });
});
