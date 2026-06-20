const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Give everyone isAdmin = true
  await prisma.user.updateMany({
    data: { isAdmin: true }
  });

  // Abhijeetp976 is the Seeker (we know because they uploaded a resume previously in the chat)
  await prisma.user.updateMany({
    where: { email: 'Abhijeetp976@gmail.com' },
    data: { role: 'SEEKER' }
  });

  // Abhijeetp97 is the Referrer
  await prisma.user.updateMany({
    where: { email: 'Abhijeetp97@gmail.com' },
    data: { role: 'REFERRER' }
  });

  console.log("Restored user roles and set isAdmin=true!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
