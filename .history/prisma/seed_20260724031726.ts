import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: {
      email: "bhairav22@usmle.com",
    },
    update: {},
    create: {
      user_id: "SADM12345679",
      email: "bhairav22@usmle.com",
      name: "Bhairav K Sharma",
      role: "SUPERADMIN",
      passwordHash: passwordHash,
    },
  });

  console.log("✅ User seeded");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });