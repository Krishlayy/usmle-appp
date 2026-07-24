const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['SUPERADMIN', 'ADMIN'] }
    }
  });
  console.log('Admins:', users.map(u => u.email));
}

main().finally(() => prisma.$disconnect());
