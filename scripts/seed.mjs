import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const REFERRERS = [
  {
    email: 'sarah.chen@google.dummy',
    name: 'Sarah Chen',
    company: 'Google',
    role: 'Senior Software Engineer',
    bio: 'I specialize in distributed systems and backend infrastructure. Happy to refer strong engineers to Google Cloud.',
    skills: ['Go', 'Kubernetes', 'GCP', 'System Design'],
    yearsExperience: 6,
    matchScore: 92,
  },
  {
    email: 'marcus.j@meta.dummy',
    name: 'Marcus Johnson',
    company: 'Meta',
    role: 'Product Manager',
    bio: 'Building the next generation of social experiences. Looking for data-driven PMs and creative frontend engineers.',
    skills: ['Product Strategy', 'A/B Testing', 'React', 'GraphQL'],
    yearsExperience: 8,
    matchScore: 88,
  },
  {
    email: 'elena.r@amazon.dummy',
    name: 'Elena Rodriguez',
    company: 'Amazon',
    role: 'Engineering Manager',
    bio: 'Leading AWS serverless teams. I look for strong problem solvers who value customer obsession.',
    skills: ['AWS', 'Leadership', 'Java', 'Node.js'],
    yearsExperience: 10,
    matchScore: 95,
  },
  {
    email: 'david.k@stripe.dummy',
    name: 'David Kim',
    company: 'Stripe',
    role: 'Backend Engineer',
    bio: 'Passionate about API design and financial infrastructure. Happy to mock interview candidates before referrals.',
    skills: ['Ruby', 'API Design', 'Fintech', 'PostgreSQL'],
    yearsExperience: 4,
    matchScore: 85,
  },
  {
    email: 'priya.p@netflix.dummy',
    name: 'Priya Patel',
    company: 'Netflix',
    role: 'UI/UX Designer',
    bio: 'Designing binge-worthy interfaces. Looking for designers with strong portfolios and prototyping skills.',
    skills: ['Figma', 'UI Design', 'Prototyping', 'User Research'],
    yearsExperience: 5,
    matchScore: 90,
  },
  {
    email: 'james.w@apple.dummy',
    name: 'James Wilson',
    company: 'Apple',
    role: 'iOS Developer',
    bio: 'Swift enthusiast working on core iOS frameworks. Can refer to various mobile teams across Apple Park.',
    skills: ['Swift', 'Objective-C', 'iOS', 'CoreData'],
    yearsExperience: 7,
    matchScore: 87,
  },
  {
    email: 'lisa.t@microsoft.dummy',
    name: 'Lisa Thompson',
    company: 'Microsoft',
    role: 'Data Scientist',
    bio: 'Azure AI team. I refer candidates with strong ML backgrounds and Azure experience.',
    skills: ['Python', 'Machine Learning', 'Azure', 'PyTorch'],
    yearsExperience: 6,
    matchScore: 94,
  },
  {
    email: 'omar.f@airbnb.dummy',
    name: 'Omar Farooq',
    company: 'Airbnb',
    role: 'Frontend Engineer',
    bio: 'Creating beautiful travel experiences. React and TypeScript experts welcome!',
    skills: ['React', 'TypeScript', 'CSS', 'Next.js'],
    yearsExperience: 4,
    matchScore: 89,
  },
  {
    email: 'nina.s@uber.dummy',
    name: 'Nina Singh',
    company: 'Uber',
    role: 'Data Engineer',
    bio: 'Scaling data pipelines for global logistics. Happy to chat about data infrastructure.',
    skills: ['Spark', 'Kafka', 'Python', 'Airflow'],
    yearsExperience: 5,
    matchScore: 91,
  },
  {
    email: 'alex.m@tesla.dummy',
    name: 'Alex Martinez',
    company: 'Tesla',
    role: 'Autopilot Engineer',
    bio: 'Working on vision systems. Looking for C++ experts with computer vision experience.',
    skills: ['C++', 'Computer Vision', 'Robotics', 'Python'],
    yearsExperience: 9,
    matchScore: 96,
  }
];

async function main() {
  console.log('🌱 Starting database seed...');
  const defaultPassword = await bcrypt.hash('Password123!', 10);

  let createdCount = 0;

  for (const ref of REFERRERS) {
    const existing = await prisma.user.findUnique({ where: { email: ref.email } });
    
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          name: ref.name,
          email: ref.email,
          password: defaultPassword,
          role: 'REFERRER',
          emailVerified: new Date(),
          referrerProfile: {
            create: {
              corporateEmail: ref.email,
              company: ref.company,
              jobTitle: ref.role,
              bio: ref.bio,
              yearsAtCompany: ref.yearsExperience,
            }
          }
        }
      });
      console.log(`Created: ${ref.name} at ${ref.company}`);
      createdCount++;
    } else {
      console.log(`Skipped (already exists): ${ref.name}`);
    }
  }

  console.log(`\n✅ Seed completed! Created ${createdCount} new referrers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
