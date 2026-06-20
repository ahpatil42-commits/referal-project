import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("=== Admin Account Creation ===");
  const email = await question("Enter Admin Email: ");
  const password = await question("Enter Admin Password: ");
  
  if (!email || !password) {
    console.log("Email and password are required.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isAdmin: true,
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
        name: "Admin User",
        role: "SEEKER",
        isAdmin: true,
        emailVerified: new Date(),
      }
    });

    console.log(`\nSuccess! Admin account for ${user.email} is ready.`);
  } catch (err) {
    console.error("Error creating admin:", err);
  }
}

main().finally(() => {
  rl.close();
  prisma.$disconnect();
});
