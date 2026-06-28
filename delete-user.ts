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
  const email = process.argv[2] || "abhijeetpatil1610@gmail.com";
  console.log(`Deleting user with email: ${email}`);

  // 1. Get user from Supabase to find their Auth ID
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Error fetching Supabase users:", listError);
    return;
  }

  const user = users.users.find((u) => u.email === email);
  if (user) {
    // Delete from Supabase Auth
    console.log(`Found in Supabase (ID: ${user.id}). Deleting...`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error("Error deleting from Supabase:", deleteError);
    } else {
      console.log("Successfully deleted from Supabase Auth!");
    }
  } else {
    console.log("User not found in Supabase Auth.");
  }

  // 2. Delete from Prisma DB
  try {
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (dbUser) {
      console.log(`Found in Database (ID: ${dbUser.id}). Deleting...`);
      await prisma.user.delete({ where: { email } });
      console.log("Successfully deleted from Postgres Database!");
    } else {
      console.log("User not found in Postgres Database.");
    }
  } catch (dbError) {
    console.error("Error deleting from Prisma:", dbError);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
