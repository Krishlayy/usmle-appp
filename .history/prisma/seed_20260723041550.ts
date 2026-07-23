
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.User.create({
    data:{
      user_id:"SADM12345678",
      email: "Khare@usmle.com",
      name: "Supreet Khare",
      role:"SUPERADMIN"
    }
  })
  
}