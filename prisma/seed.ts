import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@blueprintai.com' },
    update: {},
    create: {
      email: 'demo@blueprintai.com',
      name: 'Demo User',
    },
  });

  await prisma.prospect.upsert({
    where: { userId_profileUrl: { userId: user.id, profileUrl: 'https://www.linkedin.com/in/jane-doe' } },
    update: {},
    create: {
      userId: user.id,
      profileUrl: 'https://www.linkedin.com/in/jane-doe',
      firstName: 'Jane',
      lastName: 'Doe',
      company: 'Acme Corp',
      title: 'ServiceNow Platform Manager',
      status: 'NEW',
      tags: ['servicenow', 'platform'],
      rawAboutText: 'Leads enterprise ServiceNow platform modernization and governance.',
      rawExperienceText: '8 years owning SDLC improvements and workflow quality.',
      myNotes: 'Interested in reducing ticket-to-deploy cycle time.',
    },
  });

  console.log('Seed complete');
}

main().finally(async () => prisma.$disconnect());
