import dotenv from 'dotenv';
import path from 'path';

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require";

async function main() {
  const { prisma } = await import('../src/lib/db');

  const qbanks = await prisma.qBank.findMany({
    select: { id: true, slug: true, title: true }
  });
  console.log('QBanks in ep-cool-wildflower:', qbanks);

  const hist001 = await prisma.question.findFirst({
    where: { qid: 'HIST-001' },
    include: { media: true, explanationImages: true }
  });

  console.log('HIST-001 in ep-cool-wildflower:');
  console.log(JSON.stringify(hist001, null, 2));

  // Check all questions with media in ep-cool-wildflower
  const questionsWithMedia = await prisma.question.findMany({
    where: { media: { some: {} } },
    select: { qid: true, media: true }
  });
  console.log(`Questions with media in ep-cool-wildflower (${questionsWithMedia.length}):`);
  console.log(JSON.stringify(questionsWithMedia.slice(0, 10), null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
