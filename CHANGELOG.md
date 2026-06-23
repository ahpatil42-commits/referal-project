# Changelog

## Iteration 1 - API Security & Quota Enforcement

- **What changed:** 
  - Added rate limiting (`actionRateLimiter`) to `updateSeekerProfile`, `updateReferrerProfile`, and `updateRequestStatus`.
  - Added backend quota enforcement for `maxReferrals` in `sendReferralRequest`.
- **Why it changed:** To prevent DoS/spam attacks on profile endpoints and to prevent seekers from bypassing the referral limit by hitting the API directly.
- **Impact level:** High (Security/Stability).
- **Remaining issues:** ATS API keys are still stored in plaintext. We need to implement encryption for them if Phase 2 ATS integrations are activated.

## Iteration 2 - Resume Upload Reliability & Performance

- **What changed:** 
  - Updated UploadThing \core.ts\ to directly persist the esumeUrl and image to the database on successful upload.
  - Implemented an LRU-style Map cache for Gemini Match Scores in \ctions/matching.ts\.
- **Why it changed:** 
  - Prevents data loss if a user successfully uploads a file but navigates away without clicking 'Save Profile'.
  - Prevents hammering the Gemini API and improves Browse page load times significantly by caching predictions for 1 hour.
- **Impact level:** High (Reliability & Performance).
- **Remaining issues:** Caching is in-memory per Node instance, meaning multiple instances or Vercel edge functions might not share the cache. A centralized Redis cache would be ideal for Phase 3.
