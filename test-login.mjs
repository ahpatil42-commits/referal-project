import fs from 'fs';

async function main() {
  // 1. Get CSRF Token
  const csrfRes = await fetch("http://localhost:3000/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookies = csrfRes.headers.getSetCookie();
  console.log("Got CSRF:", csrfToken);

  // 2. Login
  const loginForm = new URLSearchParams({
    email: 'Abhijeetp976@gmail.com',
    password: 'password123', // Assuming the user used 'password123' based on typical defaults
    csrfToken: csrfToken,
    callbackUrl: 'http://localhost:3000/dashboard/seeker',
    json: 'true'
  });

  const loginRes = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookies.map(c => c.split(';')[0]).join('; ')
    },
    body: loginForm.toString()
  });

  const loginResJson = await loginRes.json();
  console.log("Login Res:", loginResJson);

  const authCookies = loginRes.headers.getSetCookie();
  if (!authCookies) {
    console.log("No auth cookies received! Login failed.");
    return;
  }

  const allCookies = [...cookies.map(c => c.split(';')[0]), ...authCookies.map(c => c.split(';')[0])].join('; ');

  // 3. Get Session
  const sessionRes = await fetch("http://localhost:3000/api/auth/session", {
    headers: { "Cookie": allCookies }
  });
  console.log("Session:", await sessionRes.json());

  // 4. Hit /admin
  const adminRes = await fetch("http://localhost:3000/admin", {
    headers: { "Cookie": allCookies }
  });
  console.log("/admin Status:", adminRes.status);
}

main().catch(console.error);
