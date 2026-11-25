import dotenv from 'dotenv';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require';

async function main() {
  const { prisma } = await import('../src/lib/db');
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'krishlayy' } },
    include: { Account: true, purchases: true }
  });
  console.log('User krishlayy in ep-cool-wildflower:');
  console.log(JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}
main().catch(console.error);
