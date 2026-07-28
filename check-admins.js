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
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  for (const u of users) {
    console.log(`Email: ${u.email}, Verified: ${!!u.emailVerified}, HasPassword: ${!!u.passwordHash}`);
    // Check if password matches 'admin123!'
    if (u.passwordHash) {
      const isMatch = await bcrypt.compare('admin123!', u.passwordHash);
      console.log(`  Password Match for 'admin123!': ${isMatch}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
