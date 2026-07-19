import { prisma } from './src/lib/db';

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, isBlocked: true, passwordHash: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

checkUsers().catch(console.error).finally(() => process.exit(0));
