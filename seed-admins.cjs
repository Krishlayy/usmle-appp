const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123!', 10);
  const now = new Date();

  // "create 5 admin panels dr poojan, dr jenny, dr ermi, dr neegar, dr ermi"
  const admins = [
    { name: 'Dr. Poojan', email: 'drpoojan@mqb.com' },
    { name: 'Dr. Jenny', email: 'drjenny@mqb.com' },
    { name: 'Dr. Ermi', email: 'drermi@mqb.com' },
    { name: 'Dr. Neegar', email: 'drneegar@mqb.com' },
    { name: 'Dr. Ermi 2', email: 'drermi2@mqb.com' }, // Created a 5th just in case they meant 5 separate accounts.
  ];

  console.log('Seeding admins...');

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    
    if (!existing) {
      await prisma.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          passwordHash,
          role: 'ADMIN',
          emailVerified: now,
        },
      });
      console.log(`Created admin: ${admin.name} (${admin.email})`);
    } else {
      await prisma.user.update({
        where: { email: admin.email },
        data: {
          role: 'ADMIN',
          emailVerified: now,
        }
      });
      console.log(`Updated existing user to admin: ${admin.name} (${admin.email})`);
    }
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
