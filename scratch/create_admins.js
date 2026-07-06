require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  for (let i = 1; i <= 3; i++) {
    const email = `admin${i}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', passwordHash },
      create: {
        email,
        name: `Test Admin ${i}`,
        role: 'ADMIN',
        passwordHash
      }
    });
    console.log(`Created/Updated: ${user.email} (Role: ${user.role})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
