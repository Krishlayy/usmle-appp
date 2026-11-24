import dotenv from 'dotenv';
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require';

async function main() {
  const { prisma } = await import('../src/lib/db');
  
  const deleted = await prisma.purchase.deleteMany({});
  console.log(`Deleted ${deleted.count} test purchase records.`);

  // Also verify that all 4 QBanks are active with their correct prices
  const qbanks = await prisma.qBank.findMany({
    select: { id: true, slug: true, title: true, price: true, isActive: true }
  });
  console.log('Current Active QBanks in DB:');
  for (const q of qbanks) {
    console.log(` - ${q.slug}: "${q.title}" | $${(q.price/100).toFixed(2)} | Active: ${q.isActive}`);
  }

  await prisma.$disconnect();
}
main().catch(console.error);
