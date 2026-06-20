const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'testseeker@example.com' },
    include: { seekerProfile: true }
  });
  console.log(JSON.stringify(user.seekerProfile, null, 2));
}
main().finally(() => prisma.$disconnect());
