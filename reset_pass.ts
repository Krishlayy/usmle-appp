import { prisma } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function reset() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.updateMany({
    where: { email: 'student@test.com' },
    data: { passwordHash: hash }
  });
  console.log("Password for student@test.com reset to password123");
}

reset().catch(console.error).finally(() => process.exit(0));
