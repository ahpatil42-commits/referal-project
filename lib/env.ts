import { z } from "zod";

const envSchema = z.object({
  // ── Required ─────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET:  z.string().min(1),

  // ── AI ────────────────────────────────────────────────────────
  GEMINI_API_KEY: z.string().optional(),

  // ── Email ─────────────────────────────────────────────────────
  RESEND_API_KEY:    z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // ── Payments ──────────────────────────────────────────────────
  STRIPE_SECRET_KEY:               z.string().optional(),
  STRIPE_WEBHOOK_SECRET:           z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // ── Real-time (Pusher) ────────────────────────────────────────
  PUSHER_APP_ID:              z.string().optional(),
  PUSHER_SECRET:              z.string().optional(),
  NEXT_PUBLIC_PUSHER_KEY:     z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().optional(),

  // ── File Uploads (Vercel Blob) ────────────────────────────────
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // ── Rate Limiting (Upstash Redis) ─────────────────────────────
  UPSTASH_REDIS_REST_URL:   z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── ATS Encryption ────────────────────────────────────────────
  ENCRYPTION_KEY: z.string().optional(),

  // ── Error Tracking ────────────────────────────────────────────
  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET:  process.env.AUTH_SECRET,

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  RESEND_API_KEY:    process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,

  STRIPE_SECRET_KEY:                  process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET:              process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

  PUSHER_APP_ID:              process.env.PUSHER_APP_ID,
  PUSHER_SECRET:              process.env.PUSHER_SECRET,
  NEXT_PUBLIC_PUSHER_KEY:     process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,

  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  UPSTASH_REDIS_REST_URL:   process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,

  SENTRY_DSN: process.env.SENTRY_DSN,
});
