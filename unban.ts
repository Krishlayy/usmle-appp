import { prisma } from './src/lib/db';

async function unbanAll() {
  const result = await prisma.user.updateMany({
    data: {
      isBlocked: false,
      securityViolations: 0
    }
  });
  console.log(`Unbanned ${result.count} users.`);
}

unbanAll()
  .catch(console.error)
  .finally(() => process.exit(0));
