import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.user.create({
    data: {
      user_id: "SADM12345678",
      email: "khare@usmle.com",
      name: "Supreet Khare",
      role: "SUPERADMIN",
      password: passwordHash,
    },
  });

  console.log("✅ Database seeded with one user");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });