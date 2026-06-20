const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const allReferrers = await prisma.referrerProfile.findMany({
    where: {
      company: { not: null },
    },
    include: {
      user: { select: { email: true, name: true } },
      receivedRequests: {
        where: {
          status: "ACCEPTED",
          createdAt: { gte: startOfMonth },
        },
        select: { id: true }, // We only need the count
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const referrers = allReferrers.filter(ref => ref.receivedRequests.length < ref.maxReferrals);
  console.log("Filtered Referrers Count:", referrers.length);
}
main().finally(() => prisma.$disconnect());
