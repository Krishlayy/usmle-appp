require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const qbanks = await prisma.qBank.findMany();
  console.log(qbanks.map(q => ({ title: q.title, price: q.price })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
