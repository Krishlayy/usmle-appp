require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Missing credentials');
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase() },
  });

  if (!user || !user.passwordHash) {
    throw new Error('No user found');
  }

  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return user;
}

async function main() {
  try {
    const user = await authorize({ email: 'drzufeshan@mqb.com', password: 'admin123!' });
    console.log('Login Success!', user.email);
  } catch (error) {
    console.error('Login Failed!', error.message);
  }
}

main().finally(() => prisma.$disconnect());
