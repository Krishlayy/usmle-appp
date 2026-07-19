const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

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
  .finally(() => prisma.$disconnect());
