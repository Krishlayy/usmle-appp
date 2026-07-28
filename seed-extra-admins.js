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
  const admins = ['Zufeshan', 'Priyam', 'Pavithra'];
  const password = await bcrypt.hash('admin123!', 10);

  for (const name of admins) {
    const email = name.toLowerCase() + '@admin.com';
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN', name },
      create: { 
        email, 
        name, 
        passwordHash: password, 
        role: 'ADMIN', 
        emailVerified: new Date() 
      }
    });
    console.log('Created admin:', email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
