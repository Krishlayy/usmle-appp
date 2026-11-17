import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/db';

interface QuestionSeed {
  qid: string;
  questionText: string;
  options: any[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  subtopic: string;
  videoUrl?: string | null;
  videoPosition: string;
  status: string;
  media: any[];
}

interface QBankSeed {
  title: string;
  slug: string;
  qbankCode: string;
  price: number;
  specialtyTag: string;
  description: string;
  totalQuestions: number;
  difficulty: string;
  highYieldScore: number;
  boardCoverage: string;
  isActive: boolean;
  questions: QuestionSeed[];
}

async function main() {
  console.log('--- Starting Import of All 5 USMLE Question Banks ---');
  const seedFile = path.join(__dirname, 'qbanks_seed_data.json');
  const data: QBankSeed[] = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

  for (const b of data) {
    console.log(`\nImporting QBank: "${b.title}" (${b.slug}, code: ${b.qbankCode}) ...`);

    // Find or create QBank
    let qbank = await prisma.qBank.findFirst({
      where: {
        OR: [
          { slug: b.slug },
          { qbankCode: b.qbankCode }
        ]
      }
    });

    if (!qbank) {
      qbank = await prisma.qBank.create({
        data: {
          title: b.title,
          slug: b.slug,
          qbankCode: b.qbankCode,
          price: b.price,
          currency: 'USD',
          specialtyTag: b.specialtyTag,
          description: b.description,
          totalQuestions: b.totalQuestions,
          difficulty: b.difficulty,
          highYieldScore: b.highYieldScore,
          boardCoverage: b.boardCoverage,
          isActive: b.isActive,
          bibliographyTags: [b.specialtyTag, 'USMLE Step 1', 'Clinical Vignette']
        }
      });
      console.log(`Created QBank with ID: ${qbank.id}`);
    } else {
      qbank = await prisma.qBank.update({
        where: { id: qbank.id },
        data: {
          title: b.title,
          slug: b.slug,
          qbankCode: b.qbankCode,
          price: b.price,
          specialtyTag: b.specialtyTag,
          description: b.description,
          totalQuestions: b.totalQuestions,
          difficulty: b.difficulty,
          highYieldScore: b.highYieldScore,
          boardCoverage: b.boardCoverage,
          isActive: b.isActive
        }
      });
      console.log(`Updated existing QBank with ID: ${qbank.id}`);
    }

    // Upsert questions
    console.log(`Upserting ${b.questions.length} questions for ${b.qbankCode}...`);
    let count = 0;
    for (const q of b.questions) {
      await prisma.question.upsert({
        where: { qid: q.qid },
        create: {
          qid: q.qid,
          qbankId: qbank.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          subtopic: q.subtopic,
          videoUrl: q.videoUrl || null,
          videoPosition: q.videoPosition || 'TOP',
          status: q.status || 'PUBLISHED',
          tags: [b.specialtyTag, q.subtopic].filter(Boolean)
        },
        update: {
          qbankId: qbank.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          subtopic: q.subtopic,
          videoUrl: q.videoUrl || null,
          videoPosition: q.videoPosition || 'TOP',
          status: q.status || 'PUBLISHED',
          tags: [b.specialtyTag, q.subtopic].filter(Boolean)
        }
      });
      count++;
    }

    // Refresh total count on qbank
    const totalActual = await prisma.question.count({
      where: { qbankId: qbank.id }
    });
    await prisma.qBank.update({
      where: { id: qbank.id },
      data: { totalQuestions: totalActual }
    });
    console.log(`✓ Completed ${count} questions for "${b.title}" (Total in DB: ${totalActual})`);
  }

  console.log('\n=============================================');
  console.log('ALL 5 QUESTION BANKS AND 250 QUESTIONS IMPORTED SUCCESSFULLY!');
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('Import failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
