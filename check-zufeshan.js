require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst({
    where: { 
      email: { contains: 'zufeshan' }
    }
  });
  
  if (user) {
    const { passwordHash, ...safeUser } = user;
    console.log('User found:', safeUser);
  } else {
    console.log('No user found containing "zufeshan"');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
