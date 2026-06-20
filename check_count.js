const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.referrerProfile.count();
  console.log("Total Referrers in DB:", c);
}
main().finally(() => prisma.$disconnect());
