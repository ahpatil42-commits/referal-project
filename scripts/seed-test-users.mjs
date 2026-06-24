import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Create Seeker
  await prisma.user.upsert({
    where: { email: 'testseeker@example.com' },
    update: { emailVerified: new Date() },
    create: {
      name: 'Test Seeker',
      email: 'testseeker@example.com',
      password: passwordHash,
      role: 'SEEKER',
      emailVerified: new Date(),
    },
  });

  // Create Referrer
  await prisma.user.upsert({
    where: { email: 'testreferrer@example.com' },
    update: { emailVerified: new Date() },
    create: {
      name: 'Test Referrer',
      email: 'testreferrer@example.com',
      password: passwordHash,
      role: 'REFERRER',
      emailVerified: new Date(),
    },
  });

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'testadmin@example.com' },
    update: { emailVerified: new Date(), isAdmin: true },
    create: {
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: passwordHash,
      role: 'SEEKER',
      isAdmin: true,
      emailVerified: new Date(),
    },
  });

  console.log('Test users seeded.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
