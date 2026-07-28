require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Standardizing admins...');

  // 1. Delete drermi2@mqb.com
  try {
    await prisma.user.delete({
      where: { email: 'drermi2@mqb.com' }
    });
    console.log('Deleted drermi2@mqb.com');
  } catch (e) {
    console.log('Could not delete drermi2@mqb.com');
  }

  // 2. Standardize team members to @mqb.com
  const toUpdate = ['drzufeshan', 'drpriyam', 'drpavithra'];

  for (const prefix of toUpdate) {
    const oldEmail = prefix + '@admin.com';
    const newEmail = prefix + '@mqb.com';

    try {
      await prisma.user.update({
        where: { email: oldEmail },
        data: { email: newEmail }
      });
      console.log(`Updated ${oldEmail} to ${newEmail}`);
    } catch (e) {
      console.log(`Could not update ${oldEmail} to ${newEmail} (might already be mqb.com)`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
