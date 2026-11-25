import dotenv from 'dotenv';
import path from 'path';

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require";

async function main() {
  const { prisma } = await import('../src/lib/db');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      onboardingCompleted: true,
      purchases: {
        include: {
          qbank: { select: { slug: true, title: true } }
        }
      }
    }
  });

  console.log('Users in production DB (ep-cool-wildflower):');
  console.log(JSON.stringify(users, null, 2));

  const allPurchases = await prisma.purchase.findMany({
    include: {
      user: { select: { email: true } },
      qbank: { select: { slug: true } }
    }
  });
  console.log('All purchases in DB:');
  console.log(JSON.stringify(allPurchases, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
