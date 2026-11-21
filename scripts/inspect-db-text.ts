import 'dotenv/config';
import { prisma } from '../src/lib/db';

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    select: { email: true, name: true, role: true }
  });
  console.log('Admins in DB:', admins);
}

(async () => {
  await main();
  process.exit(0);
})();
