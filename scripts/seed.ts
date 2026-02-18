import { db } from '../lib/db';

const user = db.upsertUser('demo@blueprintai.com', 'Demo User');

try {
  db.createProspect({
    userId: user.id,
    profileUrl: 'https://www.linkedin.com/in/jane-doe',
    firstName: 'Jane',
    lastName: 'Doe',
    company: 'Acme Corp',
    title: 'ServiceNow Platform Manager',
    region: 'North America',
    rawAboutText: 'Leads enterprise ServiceNow platform modernization and governance.',
    rawExperienceText: '8 years owning SDLC improvements and workflow quality.',
    myNotes: 'Interested in reducing ticket-to-deploy cycle time.',
    tags: JSON.stringify(['servicenow', 'platform']),
  });
} catch {
  // ignore duplicate seed
}

console.log('Seed complete');
