import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dummy feedback...");

  const users = await prisma.user.findMany({ take: 3 });
  if (users.length === 0) {
    console.error("No users found in the database. Please create a user first.");
    return;
  }

  const userId = users[0].id; // Assign all to the first user for simplicity

  const feedbacks = [
    {
      userId,
      type: "FEATURE_REQUEST",
      message: "I really wish there was a dark mode toggle. The current light theme is too bright at night.",
    },
    {
      userId,
      type: "BUG",
      message: "When I click on 'My Requests', the page sometimes crashes and shows a 500 error. It happens when I have more than 10 pending requests.",
    },
    {
      userId,
      type: "GENERAL",
      message: "The new dashboard update is fantastic! Much easier to find the people I want to refer.",
    },
    {
      userId,
      type: "FEATURE_REQUEST",
      message: "Can we get an integration with Greenhouse? It would save me so much time copying and pasting candidate details.",
    },
    {
      userId,
      type: "BUG",
      message: "The mobile OTP isn't arriving for numbers outside the US. I tried +44 and it silently fails.",
    },
    {
      userId,
      type: "GENERAL",
      message: "I think the referral limit is too low for Pro users. We should be able to make at least 10 per month.",
    },
    {
      userId,
      type: "BUG",
      message: "The logo looks weirdly stretched on Safari browser on Mac. Looks fine on Chrome though.",
    }
  ];

  for (const fb of feedbacks) {
    await prisma.feedback.create({ data: fb });
  }

  console.log(`Successfully seeded ${feedbacks.length} feedback entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
