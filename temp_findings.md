# Temporary Findings for Final Report

## Phase 1 & 2
- **Sitemap**: `/`, `/pricing`, `/login`, `/register`, `/forgot-password`, `/pending-verification`
- **Broken Links & Workflows**:
  - `/api/auth/forgot-password` returns 404 (Missing API route).
  - `/api/checkout` from Pricing page returns 500 (`Stripe is not configured`).
  - Dead anchor links on landing page (`#feedback`, `#reviews`).
- **UI Glitches**:
  - Mobile menu toggle button (`md:hidden`) is visible on the desktop and opening it covers the desktop view. Breakpoint missing.
- **Console Errors**:
  - CSP style-src violation for fonts.
  - Favicon 404.
  - Vercel Web Analytics 404.

## Phase 3: Candidate Testing
- **Login Flow**: Successfully logged in using testseeker@example.com. Layout focus timing issue observed on email input on first attempt.
- **Profile Updates**: Successfully updated and persisted profile information.
- **Resume Upload**: Form successfully accepts PDF, DOCX, and TXT files.
- **Browse Section**: Displayed 11 seeded professionals.
- **Referral Request**: Successfully submitted referral request to Omar Farooq.
- **UI Glitches**: The My Requests list renders the company name twice (e.g. 'AirbnbAirbnb').
- **Console Errors**: CSP stylesheet warning for Google Fonts.

## Phase 4: Employee Testing
- Successfully completed referrers setup, profile saving, and accepting a referral request from Candidate.

## Phase 5 & 6: Security & Admin Testing
- **Authorization Bypass**: Unauthenticated access to /portal-admin correctly blocked.
- **Broken Access Control**: Non-admin users attempting to access /portal-admin correctly receive a 404 (Not Found).
- **Admin Access**: Legitimate admins successfully access /portal-admin.
- **Input Validation (FAIL)**: Empty form submissions on /register do not trigger client-side validation errors correctly before submission, relying entirely on server responses or HTML5 defaults.
