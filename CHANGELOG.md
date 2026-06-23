# Changelog

## Iteration 1 - API Security & Quota Enforcement

- **What changed:** 
  - Added rate limiting (`actionRateLimiter`) to `updateSeekerProfile`, `updateReferrerProfile`, and `updateRequestStatus`.
  - Added backend quota enforcement for `maxReferrals` in `sendReferralRequest`.
- **Why it changed:** To prevent DoS/spam attacks on profile endpoints and to prevent seekers from bypassing the referral limit by hitting the API directly.
- **Impact level:** High (Security/Stability).
- **Remaining issues:** ATS API keys are still stored in plaintext. We need to implement encryption for them if Phase 2 ATS integrations are activated.
