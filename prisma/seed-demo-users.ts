/**
 * Idempotent demo accounts: one SUPERADMIN, one ADMIN, one STUDENT (with every active Q-Bank unlocked).
 *   npm run db:seed-demo
 * Requires DATABASE_URL. Safe to re-run: passwords/roles are reset to the values below.
 * Do NOT run against a production database that has real users with these emails.
 */
import { config } from 'dotenv';
config();
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export const DEMO_USERS = [
  { role: 'SUPERADMIN', name: 'Demo Superadmin', email: 'superadmin@mqb.demo', password: 'Super#Demo2026' },
  { role: 'ADMIN', name: 'Demo Admin', email: 'admin@mqb.demo', password: 'Admin#Demo2026' },
  { role: 'STUDENT', name: 'Demo Student', email: 'student@mqb.demo', password: 'Student#Demo2026' },
] as const;

async function main() {
  const now = new Date();
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role, name: u.name, emailVerified: now, isBlocked: false, securityViolations: 0 },
      create: { email: u.email, passwordHash, role: u.role, name: u.name, emailVerified: now },
    });
    console.log(`${u.role.padEnd(10)} ${u.email}`);

    if (u.role === 'STUDENT') {
      const qbanks = await prisma.qBank.findMany({ where: { isActive: true }, select: { id: true } });
      for (const q of qbanks) {
        await prisma.purchase.upsert({
          where: { userId_qbankId: { userId: user.id, qbankId: q.id } },
          update: { status: 'active' },
          create: { userId: user.id, qbankId: q.id, amountPaidCents: 0, status: 'active' },
        });
      }
      console.log(`           unlocked ${qbanks.length} Q-Bank(s) for the student`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
