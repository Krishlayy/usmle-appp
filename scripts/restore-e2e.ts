import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let qbank = await prisma.qBank.findUnique({ where: { slug: 'e2e-test-qbank' } });
  if (!qbank) {
    qbank = await prisma.qBank.create({
      data: {
        title: 'E2E Test QBank',
        slug: 'e2e-test-qbank',
        qbankCode: 'E2ETEST',
        description: 'A test qbank for e2e that has exhibits and images',
        specialtyTag: 'Test',
        price: 1000,
        currency: 'USD',
        totalQuestions: 1,
        isActive: true, // make it active!
      }
    });
    const q = await prisma.question.create({
      data: {
        qid: `E2E-Q1-${Date.now()}`,
        qbankId: qbank.id,
        questionText: 'A 45-year-old man presents with this skin finding. What is the most likely diagnosis?',
        options: JSON.stringify([
          { id: 'A', text: 'Melanoma' },
          { id: 'B', text: 'Basal cell carcinoma' },
          { id: 'C', text: 'Squamous cell carcinoma' }
        ]),
        correctAnswer: 'B',
        explanation: 'The exhibit shows a classic pearly nodule with telangiectasias, typical of basal cell carcinoma.',
        difficulty: 'easy',
        subtopic: 'Dermatology',
      }
    });
    
    await prisma.questionMedia.create({
      data: { 
        questionId: q.id, 
        url: 'https://images.unsplash.com/photo-1612450531560-671c66761502?w=800', 
        caption: 'Skin Lesion Exhibit', 
        type: 'IMAGE' 
      }
    });
    console.log('Created E2E Test QBank');
  } else {
    await prisma.qBank.update({
      where: { id: qbank.id },
      data: { isActive: true }
    });
    console.log('Updated E2E Test QBank to active');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
