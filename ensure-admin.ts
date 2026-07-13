import 'dotenv/config';
import { prisma } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (adminUser) {
    console.log(`Found existing admin: ${adminUser.email}`);
    const passwordHash = await bcrypt.hash('admin12345', 10);
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash },
    });
    console.log(`Password reset to: admin12345`);
  } else {
    console.log('No admin found. Creating one...');
    const passwordHash = await bcrypt.hash('admin12345', 10);
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@medprep.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`Created admin: ${adminUser.email}`);
    console.log(`Password: admin12345`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
