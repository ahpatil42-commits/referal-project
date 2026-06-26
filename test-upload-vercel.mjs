/**
 * test-upload-vercel.mjs
 * Tests profile photo upload on the live Vercel deployment.
 *
 * Steps:
 *  1. Get CSRF token from Vercel
 *  2. Log in as tester_vercel_123@example.com
 *  3. Verify session
 *  4. Test /api/upload (onBeforeGenerateToken) — avatar payload
 *  5. Test /api/upload/image (direct base64 endpoint)
 *  6. Report results
 */

const BASE_URL = 'https://referal-project.vercel.app';
const EMAIL    = 'tester_vercel_123@example.com';
const PASSWORD = 'Password123!';

function banner(title) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function result(label, value) {
  const icon = (typeof value === 'number' && value >= 200 && value < 300) ? '✅' :
               (typeof value === 'number' && value >= 400)               ? '❌' : 'ℹ️ ';
  console.log(`  ${icon}  ${label}: ${JSON.stringify(value)}`);
}

/** Parse a raw Set-Cookie header value into { name, value } */
function parseCookies(setCookieHeaders) {
  return setCookieHeaders.map(h => h.split(';')[0]);  // "name=value"
}

/** Build a Cookie header string from an array of "name=value" strings */
function joinCookies(arr) {
  return [...new Set(arr)].join('; ');
}

async function main() {
  // ── STEP 1 ──────────────────────────────────────────────────────────
  banner('STEP 1 — Get CSRF Token');
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookies = parseCookies(csrfRes.headers.getSetCookie());
  result('CSRF token (first 12 chars)', csrfToken ? csrfToken.slice(0, 12) + '...' : 'MISSING');
  result('CSRF cookies set', csrfCookies.length);

  if (!csrfToken) {
    console.log('\n❌  No CSRF token returned – aborting.\n');
    process.exit(1);
  }

  // ── STEP 2 ──────────────────────────────────────────────────────────
  banner('STEP 2 — Login (credentials)');
  /*
   * NextAuth requires:
   *  - Cookie: __Host-next-auth.csrf-token=<hash>%7C<token>   (the raw cookie value)
   *  - Body:   csrfToken=<token_part_only>
   *
   * The CSRF cookie value is   HASH|TOKEN   and the body needs just TOKEN.
   */
  const loginBody = new URLSearchParams({
    email:       EMAIL,
    password:    PASSWORD,
    csrfToken,
    callbackUrl: `${BASE_URL}/dashboard/seeker`,
    json:        'true',
  });

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method:   'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie':        joinCookies(csrfCookies),
      'Origin':        BASE_URL,
      'Referer':       `${BASE_URL}/login`,
    },
    body: loginBody.toString(),
  });

  result('Login HTTP status', loginRes.status);
  const redirectLoc = loginRes.headers.get('location') ?? '';
  result('Redirect location', redirectLoc);

  const loginSetCookies = parseCookies(loginRes.headers.getSetCookie());
  result('Auth cookies returned', loginSetCookies.length);

  // Accumulate all cookies
  let allCookies = [...csrfCookies, ...loginSetCookies];

  // If we got redirected to the callback URL (success) we may need to follow
  // and grab the session token cookie from the final page.
  if (loginRes.status === 302 && !redirectLoc.includes('error')) {
    const followRes = await fetch(redirectLoc, {
      redirect: 'manual',
      headers: { 'Cookie': joinCookies(allCookies) },
    });
    const moreCookies = parseCookies(followRes.headers.getSetCookie());
    allCookies = [...allCookies, ...moreCookies];
    result('Cookies after follow redirect', moreCookies.length);
  } else if (redirectLoc.includes('error')) {
    // Extract just the error query param
    const url = new URL(redirectLoc);
    result('Login error', url.searchParams.get('error'));
  }

  // ── STEP 3 ──────────────────────────────────────────────────────────
  banner('STEP 3 — Verify Session');
  const sessionRes  = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { 'Cookie': joinCookies(allCookies) },
  });
  const sessionData = await sessionRes.json();
  result('Session user', sessionData?.user?.email ?? 'NOT AUTHENTICATED');
  result('Session role', sessionData?.user?.role  ?? 'n/a');

  if (!sessionData?.user?.email) {
    console.log('\n❌  Login failed — cannot test authenticated endpoints.');
    console.log('    Possible causes:');
    console.log('    1. User tester_vercel_123@example.com does not exist in the Vercel DB');
    console.log('    2. Password is wrong');
    console.log('    3. NextAuth TRUST_HOST / NEXTAUTH_URL not configured for Vercel');

    // Try unauthenticated calls anyway to see what errors we get
    banner('STEP 4 (unauthenticated) — /api/upload response');
    const tokenBody = {
      type: 'blob.generate-client-token',
      payload: { pathname: 'test_avatar.png', callbackUrl: `${BASE_URL}/api/upload`, clientPayload: 'avatar', multipart: false },
    };
    const unauthRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenBody),
    });
    result('/api/upload (unauthenticated) status', unauthRes.status);
    result('/api/upload (unauthenticated) body', await unauthRes.text().then(t => t.slice(0, 300)));
    process.exit(0);
  }

  // ── STEP 4 ──────────────────────────────────────────────────────────
  banner('STEP 4 — /api/upload — avatar token generation (Vercel Blob)');
  const avatarTokenBody = {
    type: 'blob.generate-client-token',
    payload: {
      pathname:      'test_avatar.png',
      callbackUrl:   `${BASE_URL}/api/upload`,
      clientPayload: 'avatar',
      multipart:     false,
    },
  };

  const avatarRes  = await fetch(`${BASE_URL}/api/upload`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie':        joinCookies(allCookies),
    },
    body: JSON.stringify(avatarTokenBody),
  });
  const avatarText = await avatarRes.text();
  result('/api/upload (avatar) status', avatarRes.status);
  try   { result('/api/upload (avatar) response', JSON.parse(avatarText)); }
  catch { result('/api/upload (avatar) raw', avatarText.slice(0, 500)); }

  // ── STEP 5 ──────────────────────────────────────────────────────────
  banner('STEP 5 — /api/upload — resume token generation (Vercel Blob)');
  const resumeTokenBody = {
    type: 'blob.generate-client-token',
    payload: {
      pathname:      'test_resume.pdf',
      callbackUrl:   `${BASE_URL}/api/upload`,
      clientPayload: 'resume',
      multipart:     false,
    },
  };

  const resumeRes  = await fetch(`${BASE_URL}/api/upload`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie':        joinCookies(allCookies),
    },
    body: JSON.stringify(resumeTokenBody),
  });
  const resumeText = await resumeRes.text();
  result('/api/upload (resume) status', resumeRes.status);
  try   { result('/api/upload (resume) response', JSON.parse(resumeText)); }
  catch { result('/api/upload (resume) raw', resumeText.slice(0, 500)); }

  // ── STEP 6 ──────────────────────────────────────────────────────────
  banner('STEP 6 — /api/upload/image (base64 direct endpoint)');
  const pngBytes = Buffer.from([
    137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,
    0,0,0,1,0,0,0,1,8,2,0,0,0,144,119,83,222,0,0,0,12,
    73,68,65,84,8,215,99,248,207,192,0,0,0,2,0,1,232,
    33,188,51,0,0,0,0,73,69,78,68,174,66,96,130
  ]);
  const formData = new FormData();
  formData.append('file', new Blob([pngBytes], { type: 'image/png' }), 'test_avatar.png');

  const directRes  = await fetch(`${BASE_URL}/api/upload/image`, {
    method:  'POST',
    headers: { 'Cookie': joinCookies(allCookies) },
    body:    formData,
  });
  const directText = await directRes.text();
  result('/api/upload/image status', directRes.status);
  try   { result('/api/upload/image response', JSON.parse(directText)); }
  catch { result('/api/upload/image raw', directText.slice(0, 500)); }

  // ── SUMMARY ─────────────────────────────────────────────────────────
  banner('SUMMARY');
  const avatarOk = avatarRes.status >= 200 && avatarRes.status < 400;
  const directOk = directRes.status >= 200 && directRes.status < 300;
  console.log(`  ${avatarOk ? '✅' : '❌'}  /api/upload avatar token gen:  HTTP ${avatarRes.status}`);
  console.log(`  ${directOk ? '✅' : '❌'}  /api/upload/image (base64):    HTTP ${directRes.status}`);
  console.log('');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
