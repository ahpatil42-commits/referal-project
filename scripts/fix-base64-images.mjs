/**
 * scripts/fix-base64-images.mjs
 *
 * One-time migration: finds all users whose `image` column contains a
 * Base64 data URI (data:image/...) and sets it to NULL.
 *
 * Base64 images in `user.image` caused the 494 REQUEST_HEADER_TOO_LARGE
 * error on Vercel because NextAuth embedded the image in the session
 * response headers on every request.
 *
 * After running this script, those users will see the default avatar
 * fallback until they re-upload via the Vercel Blob flow.
 *
 * Run with:
 *   node scripts/fix-base64-images.mjs
 */

import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const db = new PrismaClient();

async function main() {
  console.log('🔍  Scanning for Base64 images in user.image …\n');

  // Find all users whose image starts with "data:"
  const affected = await db.user.findMany({
    where: {
      image: { startsWith: 'data:' },
    },
    select: { id: true, email: true, image: true },
  });

  if (affected.length === 0) {
    console.log('✅  No Base64 images found — database is clean!');
    return;
  }

  console.log(`⚠️   Found ${affected.length} user(s) with Base64 images:\n`);
  affected.forEach(u => {
    const sizeKB = ((u.image?.length ?? 0) / 1024).toFixed(1);
    console.log(`  • ${u.email} — ${sizeKB} KB stored in DB`);
  });

  // Batch-update: set image = null for all affected users
  const result = await db.user.updateMany({
    where: { image: { startsWith: 'data:' } },
    data:  { image: null },
  });

  console.log(`\n✅  Cleared Base64 images for ${result.count} user(s).`);
  console.log('    These users should re-upload their profile photo.');
  console.log('    The new upload flow stores a short Vercel Blob URL instead of Base64.');
}

main()
  .catch(e => { console.error('❌  Error:', e); process.exit(1); })
  .finally(() => db.$disconnect());
