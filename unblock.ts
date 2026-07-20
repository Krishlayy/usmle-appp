import { prisma } from './src/lib/db';

async function unblockAll() {
  const result = await prisma.user.updateMany({
    data: {
      isBlocked: false,
      securityViolations: 0
    }
  });
  console.log(`Unblocked ${result.count} users.`);
}

unblockAll().catch(console.error).finally(() => prisma.$disconnect());
