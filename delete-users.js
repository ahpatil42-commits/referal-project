const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  console.log('All existing users completely removed from the database!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
