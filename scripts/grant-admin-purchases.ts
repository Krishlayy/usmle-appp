import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../src/lib/db';

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@medico.com' }
  });

  if (!admin) {
    console.log('Admin user not found!');
    return;
  }

  const qbanks = await prisma.qBank.findMany();
  console.log(`Granting purchases for ${qbanks.length} QBanks to ${admin.email} (ID: ${admin.id})...`);

  for (const q of qbanks) {
    const existing = await prisma.purchase.findFirst({
      where: {
        userId: admin.id,
        qbankId: q.id
      }
    });

    if (!existing) {
      await prisma.purchase.create({
        data: {
          userId: admin.id,
          qbankId: q.id,
          amountPaidCents: q.price,
          stripeSessionId: `mock_admin_${q.qbankCode.toLowerCase()}`
        }
      });
      console.log(`✓ Granted purchase for: ${q.title}`);
    } else {
      console.log(`Already owned: ${q.title}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
