# ReferralAI

> A full-stack AI-powered referral marketplace connecting job seekers with professionals who can provide internal referrals at top companies.

---

## Features

- **Seeker Dashboard** — Browse referrers, send referral requests, track status, and chat in real-time
- **Referrer Dashboard** — Manage incoming requests, post open roles, accept/reject with notes
- **AI Match Scoring** — Google Gemini scores seeker-referrer compatibility (Redis-cached)
- **Real-time Messaging** — Pusher-powered in-app chat per referral request
- **OTP Verification** — Email (Resend) + SMS 6-digit OTP on sign-up
- **OAuth** — Google, Facebook, LinkedIn sign-in via NextAuth v5
- **Stripe Payments** — Subscription plans (Free / Pro)
- **Admin Portal** — Platform stats, user management, suspension controls
- **Corporate Email Verification** — Verified checkmark for referrers with corporate emails

---

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ (local or hosted — e.g. Neon, Supabase)
- **Redis** (local or hosted — e.g. Upstash) for rate limiting and AI score caching
- A **Resend** account for transactional email
- A **Pusher** account for real-time events
- A **Stripe** account for payment processing
- A **Google Gemini API key** for AI match scoring

---

## Environment Setup

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname"

# NextAuth v5
AUTH_SECRET="at-least-32-characters-random-string"
NEXTAUTH_URL="http://localhost:3000"

# OAuth providers (optional for local dev)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=
AUTH_LINKEDIN_ID=
AUTH_LINKEDIN_SECRET=

# Gemini AI
GEMINI_API_KEY=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Pusher (real-time)
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Redis
REDIS_URL="redis://localhost:6379"

# Encryption (ATS API keys) — must be exactly 32 characters
ENCRYPTION_KEY=

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Installation & Local Dev

```bash
# 1. Install dependencies
npm install

# 2. Push schema to database (no migration history needed for dev)
npm run db:push

# 3. (Optional) Seed test data
npm run db:seed

# 4. Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Create an Admin User

After seeding or registering your first user:

```bash
npm run create-admin
```

Follow the prompts to promote a user to admin.

---

## Key URLs

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/login` | Sign in |
| `/register` | Sign up (choose Seeker or Referrer) |
| `/dashboard/seeker` | Seeker dashboard |
| `/dashboard/referrer` | Referrer dashboard |
| `/portal-admin` | Admin portal (requires `isAdmin = true`) |
| `/pricing` | Subscription pricing page |

---

## Database Management

```bash
npm run db:push      # Sync schema to DB (dev)
npm run db:studio    # Open Prisma Studio (GUI)
npm run db:seed      # Seed with sample data
npm run db:generate  # Regenerate Prisma Client
```

---

## Project Structure

```
app/              Next.js App Router pages
  (auth)/         Login, register, verify-otp pages
  api/            API routes (AI, ATS, analytics, Stripe webhooks)
  dashboard/      Seeker + Referrer dashboards
  portal-admin/   Admin management UI
actions/          Next.js Server Actions (auth, seeker, referrer, messages, AI, admin)
components/       React components
  dashboard/      Dashboard-specific components
  marketing/      Landing page components
  ui/             Shared UI primitives
lib/              Utilities (db, mail, redis, pusher, rate-limit, encryption, sanitize)
prisma/           Prisma schema
scripts/          Admin creation, seeding, and test utilities
types/            TypeScript type extensions (NextAuth session)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | NextAuth v5 (JWT) |
| Database | PostgreSQL + Prisma |
| Cache | Redis (ioredis) |
| AI | Google Gemini |
| Real-time | Pusher |
| Email | Resend |
| Payments | Stripe |
| File Uploads | UploadThing |
| Analytics | Vercel Analytics |
