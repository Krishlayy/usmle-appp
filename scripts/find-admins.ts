import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const superadmins = await prisma.user.findMany({
    where: { role: 'SUPERADMIN' }
  });
  console.log('SUPERADMINS:', superadmins.map(u => u.email));

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  console.log('ADMINS:', admins.map(u => u.email));
}

main().finally(() => prisma.$disconnect());
