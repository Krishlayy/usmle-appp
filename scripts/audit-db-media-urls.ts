import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require";

async function main() {
  const { prisma } = await import('../src/lib/db');

  const qbanks = await prisma.qBank.findMany({
    select: { id: true, slug: true, title: true }
  });

  const uploadDir = path.join(__dirname, '..', 'public');

  for (const qb of qbanks) {
    console.log(`\n=================== QBank: ${qb.slug} (${qb.title}) ===================`);
    const questions = await prisma.question.findMany({
      where: { qbankId: qb.id },
      include: { media: true, explanationImages: true }
    });

    let totalMedia = 0;
    let missingMedia = 0;
    let totalExplImg = 0;
    let missingExplImg = 0;

    const sampleMedia: any[] = [];

    for (const q of questions) {
      for (const m of q.media) {
        totalMedia++;
        const localPath = path.join(uploadDir, m.url.replace(/^\//, ''));
        if (!fs.existsSync(localPath)) {
          missingMedia++;
          if (sampleMedia.length < 5) {
            sampleMedia.push({ qid: q.qid, url: m.url, exists: false });
          }
        }
      }

      for (const e of q.explanationImages) {
        totalExplImg++;
        const localPath = path.join(uploadDir, e.url.replace(/^\//, ''));
        if (!fs.existsSync(localPath)) {
          missingExplImg++;
          if (sampleMedia.length < 5) {
            sampleMedia.push({ qid: q.qid, url: e.url, type: 'expl', exists: false });
          }
        }
      }

      // Check <img> in questionText
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(q.questionText)) !== null) {
        const src = match[1];
        if (src.startsWith('/uploads/')) {
          const localPath = path.join(uploadDir, src.replace(/^\//, ''));
          if (!fs.existsSync(localPath) && sampleMedia.length < 5) {
            sampleMedia.push({ qid: q.qid, url: src, type: 'questionTextImg', exists: false });
          }
        }
      }
    }

    console.log(`Total Media: ${totalMedia}, Missing on disk: ${missingMedia}`);
    console.log(`Total Expl Images: ${totalExplImg}, Missing on disk: ${missingExplImg}`);
    if (sampleMedia.length > 0) {
      console.log('Sample missing URLs:', JSON.stringify(sampleMedia, null, 2));
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
