require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('WARNING: This will delete ALL data (Users, QBanks, Purchases, Progress). Are you sure? (type "yes"): ', async (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('Aborting database reset.');
    process.exit(0);
  }

  console.log('Resetting database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Delete in order to respect foreign key constraints
    await prisma.questionImage.deleteMany();
    await prisma.questionMedia.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.testSession.deleteMany();
    await prisma.question.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.qBank.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Database successfully wiped!');
  } catch (error) {
    console.error('Error wiping database:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
});
