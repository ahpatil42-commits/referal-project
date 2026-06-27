import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("⚠️ STARTING FULL DATABASE WIPE...");

  // 1. Delete ALL users from Supabase Auth
  console.log("1. Fetching all users from Supabase Auth...");
  let hasMore = true;
  let page = 1;
  let deletedCount = 0;

  while (hasMore) {
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    
    if (listError || !users) {
      console.error("Error fetching Supabase users:", listError);
      break;
    }

    for (const u of users.users) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(u.id);
      if (deleteError) {
        console.error(`Failed to delete Supabase user ${u.email}:`, deleteError);
      } else {
        deletedCount++;
      }
    }

    hasMore = users.users.length === 1000;
    page++;
  }
  console.log(`✅ Successfully deleted ${deletedCount} users from Supabase Auth.`);

  // 2. Delete ALL data from Prisma (PostgreSQL)
  console.log("2. Wiping Prisma Database (PostgreSQL)...");
  
  try {
    // Delete Job Postings
    const jobs = await prisma.jobPosting.deleteMany({});
    console.log(`✅ Deleted ${jobs.count} Job Postings.`);

    // Delete all Users (This will Cascade and automatically delete all Profiles, Referrals, Requests, Messages, and Notifications!)
    const users = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${users.count} Users (and all cascaded profiles/referrals).`);
    
    // Also delete any OTPs/Tokens just in case
    await prisma.verificationToken.deleteMany({});
    await prisma.verificationOTP.deleteMany({});

    console.log("🎉 DATABASE COMPLETELY WIPED! You are ready to start fresh.");
  } catch (dbError) {
    console.error("Error wiping Prisma Database:", dbError);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
