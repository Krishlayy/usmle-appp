require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Updating admins...');

  // 1. Delete drermi2
  try {
    await prisma.user.delete({
      where: { email: 'drermi2@admin.com' }
    });
    console.log('Deleted drermi2@admin.com');
  } catch (e) {
    console.log('Could not delete drermi2@admin.com, might not exist.');
  }

  // 2. Add 'dr' to the team members (Zufeshan, Priyam, Pavithra)
  const toUpdate = ['zufeshan', 'priyam', 'pavithra'];
  const password = await bcrypt.hash('admin123!', 10);

  for (const name of toUpdate) {
    const oldEmail = name + '@admin.com';
    const newEmail = 'dr' + name + '@admin.com';
    const displayName = 'Dr. ' + name.charAt(0).toUpperCase() + name.slice(1);

    // Delete the old one if it exists
    try {
      await prisma.user.delete({
        where: { email: oldEmail }
      });
      console.log('Deleted old email:', oldEmail);
    } catch (e) {}

    // Upsert the new one
    await prisma.user.upsert({
      where: { email: newEmail },
      update: { role: 'ADMIN', name: displayName },
      create: { 
        email: newEmail, 
        name: displayName, 
        passwordHash: password, 
        role: 'ADMIN', 
        emailVerified: new Date() 
      }
    });
    console.log('Created new admin:', newEmail);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
