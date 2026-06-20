const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({ data: { isAdmin: true, role: 'SEEKER' } });
  console.log("All users are now admins! (And role reset to SEEKER just in case it was broken)");
}
main().finally(() => prisma.$disconnect());
