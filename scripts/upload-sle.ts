import 'dotenv/config';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete in order to respect foreign keys
  console.log("Deleting existing data...");
  await prisma.userProgress.deleteMany({});
  await prisma.testSession.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.questionMedia.deleteMany({});
  await prisma.questionImage.deleteMany({});
  await prisma.questionIssue.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.qBank.deleteMany({});
  
  // Read the JSON file
  const fileContent = fs.readFileSync('archive/sle_question.json', 'utf-8');
  const data = JSON.parse(fileContent);
  
  // Create the new QBank
  console.log("Creating SLE QBank...");
  const qbank = await prisma.qBank.create({
    data: {
      title: 'USMLE QBank',
      slug: 'usmle-qbank',
      qbankCode: 'USMLE',
      description: 'The main USMLE question bank in perfect format.',
      specialtyTag: 'General',
      price: 2900,
      currency: 'USD',
      totalQuestions: 1,
      isActive: true,
    }
  });

  // Create the question
  console.log("Uploading question...");
  await prisma.question.create({
    data: {
      qid: `SLE-1`,
      qbankId: qbank.id,
      questionText: data.questionText,
      options: data.options,
      correctAnswer: 'D', 
      explanation: data.explanation,
      difficulty: 'medium',
      subtopic: 'Rheumatology',
    }
  });

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
