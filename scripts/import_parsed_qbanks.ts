import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/db';

async function main() {
  const jsonPath = path.join(__dirname, 'qbanks_parsed_all.json');
  console.log(`Reading parsed questions from ${jsonPath}...`);
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const allBanks = JSON.parse(rawData);

  console.log(`Found ${allBanks.length} QBanks to import.`);

  for (const bank of allBanks) {
    console.log(`\n-----------------------------------------------------`);
    console.log(`Importing QBank: ${bank.title} (${bank.slug})...`);

    // 1. Upsert QBank
    const qbank = await prisma.qBank.upsert({
      where: { slug: bank.slug },
      update: {
        title: bank.title,
        specialtyTag: bank.specialtyTag,
        description: bank.description,
        totalQuestions: bank.questions.length,
        isActive: true,
      },
      create: {
        title: bank.title,
        slug: bank.slug,
        qbankCode: bank.slug.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8),
        specialtyTag: bank.specialtyTag,
        description: bank.description,
        totalQuestions: bank.questions.length,
        price: 2900,
        currency: 'USD',
        difficulty: 'Intermediate',
        highYieldScore: 9.0,
        boardCoverage: 'USMLE Step 1 & Step 2 CK',
        isActive: true,
      },
    });

    console.log(`QBank ID: ${qbank.id} (${qbank.slug})`);

    // 2. Import Questions
    let qCount = 0;
    let mediaCount = 0;

    for (const q of bank.questions) {
      // Upsert Question
      const question = await prisma.question.upsert({
        where: { qid: q.qid },
        update: {
          qbankId: qbank.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          acceptableAnswers: q.acceptableAnswers || [q.correctAnswer],
          explanation: q.explanation,
          difficulty: q.difficulty || 'medium',
          subtopic: q.subtopic || q.title,
          videoUrl: q.videoUrl || null,
        },
        create: {
          qid: q.qid,
          qbankId: qbank.id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          acceptableAnswers: q.acceptableAnswers || [q.correctAnswer],
          explanation: q.explanation,
          difficulty: q.difficulty || 'medium',
          subtopic: q.subtopic || q.title,
          videoUrl: q.videoUrl || null,
        },
      });

      // Clear existing media for this question to avoid duplicate inserts
      await prisma.questionMedia.deleteMany({
        where: { questionId: question.id },
      });

      // Insert Vignette Exhibits
      if (q.vignetteImages && q.vignetteImages.length > 0) {
        for (let idx = 0; idx < q.vignetteImages.length; idx++) {
          await prisma.questionMedia.create({
            data: {
              questionId: question.id,
              type: 'IMAGE',
              url: q.vignetteImages[idx],
              caption: `${q.title} - Question Exhibit ${idx + 1}`,
              placement: 'TOP',
              displaySize: 'LARGE',
              order: idx,
            },
          });
          mediaCount++;
        }
      }

      // Insert Explanation Exhibits
      if (q.explanationImages && q.explanationImages.length > 0) {
        for (let idx = 0; idx < q.explanationImages.length; idx++) {
          await prisma.questionMedia.create({
            data: {
              questionId: question.id,
              type: 'IMAGE',
              url: q.explanationImages[idx],
              caption: `${q.title} - Clinical Reference Exhibit ${idx + 1}`,
              placement: 'BOTTOM',
              displaySize: 'MEDIUM',
              order: idx,
            },
          });
          mediaCount++;
        }
      }

      qCount++;
      if (qCount % 10 === 0) {
        console.log(`  Imported ${qCount}/${bank.questions.length} questions...`);
      }
    }

    console.log(`✓ Completed QBank ${bank.title}: ${qCount} questions, ${mediaCount} exhibits.`);
  }

  console.log(`\n=====================================================`);
  console.log(`ALL 3 QBANKS IMPORTED SUCCESSFULLY!`);
  console.log(`=====================================================`);
}

main()
  .catch((e) => {
    console.error('Import failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
