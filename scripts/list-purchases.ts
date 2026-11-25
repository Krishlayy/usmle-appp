import dotenv from 'dotenv';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require';

async function main() {
  const { prisma } = await import('../src/lib/db');
  const purchases = await prisma.purchase.findMany({
    include: {
      user: { select: { email: true, role: true } },
      qbank: { select: { slug: true } }
    }
  });
  console.log(`Purchases in ep-cool-wildflower (${purchases.length}):`);
  for (const p of purchases) {
    console.log(`User: ${p.user.email} (${p.user.role}) | QBank: ${p.qbank.slug} | Status: ${p.status} | Amount: $${(p.amountPaidCents/100).toFixed(2)} | Date: ${p.purchasedAt}`);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
