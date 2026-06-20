const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.verificationToken.findMany();
  console.log('All Verification Tokens in DB:', tokens);
  const users = await prisma.user.findMany({ select: { id: true, email: true, emailVerified: true } });
  console.log('All Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
