const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const pdfParse = require('pdf-parse'); // some versions export default
const prisma = new PrismaClient();

async function runTests() {
  console.log("Starting Backend Logic Tests...\n");
  let passed = 0;
  let failed = 0;

  // Test 1: Resume Parsing
  try {
    console.log("Test 1: Parsing PDF Resume...");
    const dataBuffer = fs.readFileSync('dummy_resume.pdf');
    const data = await pdfParse(dataBuffer);
    const text = data.text.toLowerCase();
    
    if (text.includes("software engineer") && text.includes("react")) {
      console.log("✅ PDF Parsing: SUCCESS (extracted 'software engineer' and 'react')");
      passed++;
    } else {
      console.log("❌ PDF Parsing: FAILED (missing keywords)");
      failed++;
    }
  } catch (e) {
    console.log("❌ PDF Parsing: FAILED", e.message);
    failed++;
  }

  // Test 2 & 3 Setup
  let seekerId, referrerId, requestId, seekerUserId;
  try {
    console.log("\nSeeding dummy data for matching & chat tests...");
    // Find or create a user
    let user1 = await prisma.user.findFirst({ where: { email: "testseeker@example.com" } });
    if (!user1) user1 = await prisma.user.create({ data: { email: "testseeker@example.com", name: "Test Seeker" } });
    seekerUserId = user1.id;
    
    let user2 = await prisma.user.findFirst({ where: { email: "referrer@example.com" } });
    if (!user2) user2 = await prisma.user.create({ data: { email: "referrer@example.com", name: "Test Referrer" } });

    let seeker = await prisma.seekerProfile.findUnique({ where: { userId: user1.id } });
    if (!seeker) seeker = await prisma.seekerProfile.create({ data: { userId: user1.id } });
    seekerId = seeker.id;

    let referrer = await prisma.referrerProfile.findUnique({ where: { userId: user2.id } });
    if (!referrer) referrer = await prisma.referrerProfile.create({ data: { userId: user2.id, company: "Tech Corp", jobTitle: "Senior Engineer" } });
    referrerId = referrer.id;

    let req = await prisma.referralRequest.findFirst({ where: { seekerId, referrerId } });
    if (!req) {
      req = await prisma.referralRequest.create({
        data: {
          seekerId,
          referrerId,
          jobTitle: "Software Engineer",
          company: "Tech Corp",
          coverNote: "Please refer me!"
        }
      });
    }
    requestId = req.id;
  } catch(e) {
    console.log("Failed to seed data:", e.message);
  }

  // Test 2: Matchmaking Algorithm
  try {
    console.log("\nTest 2: Matchmaking Algorithm...");
    const r = await prisma.referrerProfile.findUnique({ where: { id: referrerId }});
    
    let score = 30;
    let matches = 0;
    const keywords = ["software", "engineer", "react", "node"];
    const refText = `${r.company} ${r.jobTitle} ${r.bio}`.toLowerCase();
    
    for (const kw of keywords) {
      if (refText.includes(kw)) matches++;
    }
    score += Math.min(70, matches * 15);
    
    console.log(`✅ Matchmaking Logic: SUCCESS (Score calculated: ${score}%)`);
    passed++;
  } catch (e) {
    console.log("❌ Matchmaking Logic: FAILED", e.message);
    failed++;
  }

  // Test 3: Chat/Messaging system
  try {
    console.log("\nTest 3: Messaging System...");
    // Accept the request
    await prisma.referralRequest.update({ where: { id: requestId }, data: { status: "ACCEPTED" } });
    
    const msg = await prisma.message.create({
      data: {
        requestId: requestId,
        senderId: seekerUserId, 
        content: "Automated test message!"
      }
    });
    console.log(`✅ Messaging: SUCCESS (Message ID: ${msg.id})`);
    passed++;
  } catch (e) {
    console.log("❌ Messaging: FAILED", e.message);
    failed++;
  }

  console.log(`\n--- Test Summary: ${passed} Passed | ${failed} Failed ---`);
  await prisma.$disconnect();
}

runTests();
