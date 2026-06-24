# prisma-analytics — Secondary Analytics Database

## Purpose

This directory contains a **separate Prisma schema** for an optional, dedicated analytics database. It is intentionally decoupled from the main application database (`prisma/schema.prisma`) so that:

1. **Analytics writes never block or slow down core app queries** — they hit a different database connection pool entirely.
2. **The analytics DB can be scaled independently** — e.g. a read-optimized replica or a time-series-friendly Postgres instance.
3. **GDPR compliance is simpler** — analytics data can be wiped or anonymized independently of user account data.

## Database Connection

The analytics DB is controlled by the `ANALYTICS_DATABASE_URL` environment variable.  
If this variable is **not set**, the analytics client (`lib/analytics-db.ts`) gracefully returns `null` and no analytics events are recorded. The main app continues to function normally.

```env
# Optional — analytics DB (can be same DB as main, or separate)
ANALYTICS_DATABASE_URL="postgresql://user:password@analytics-host/analytics_db"
```

## Schema Overview

| Model | Purpose |
|---|---|
| `AnalyticSession` | One row per user visit session (anonymous or linked to a userId) |
| `PageVisit` | Every page navigation within a session, with time-spent tracking |
| `Interaction` | Click, scroll, and custom events within a session |

## Client Usage

```typescript
import { analyticsDb } from "@/lib/analytics-db";

// Always null-check before using — DB may not be configured
if (analyticsDb) {
  await analyticsDb.analyticSession.create({ ... });
}
```

## Prisma Client Output

The generated client is output to `node_modules/@prisma/analytics-client` (separate from the main `@prisma/client`). It is generated during `npm install` via the `postinstall` script in `package.json`:

```json
"postinstall": "prisma generate && prisma generate --schema=prisma-analytics/schema.prisma"
```

## Schema Push

To push the analytics schema to its database:

```bash
npx prisma db push --schema=prisma-analytics/schema.prisma
```

## Notes

- The `anonymousId` field in `AnalyticSession` is a cookie-based identifier set on the client before login.
- The `userId` field is populated only for logged-in users and links to the main `User` table (by ID, not by foreign key constraint — cross-DB FK constraints are not supported in Postgres).
- The `metadata` field in `Interaction` is a JSON-stringified payload for custom event data.
