import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_dqHa0iF8nDVP@ep-cool-wildflower-atokg8fn-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require";

async function main() {
  const { prisma } = await import('../src/lib/db');

  const qbank = await prisma.qBank.findFirst({
    where: { slug: 'approach-to-histology' }
  });

  if (!qbank) throw new Error('QBank approach-to-histology not found');

  const questions = await prisma.question.findMany({
    where: { qbankId: qbank.id },
    include: { media: true, explanationImages: true }
  });

  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'qbank', 'approach-to-histology');
  const existingFiles = fs.readdirSync(uploadDir);

  // Map prefix like "img_1_" -> existing file
  const prefixMap = new Map<string, string>();
  for (const f of existingFiles) {
    const m = f.match(/^(img_\d+_).*\.([^.]+)$/i);
    if (m) {
      prefixMap.set(m[1].toLowerCase(), f);
    }
  }

  console.log(`Indexed ${prefixMap.size} unique img_N_ prefixes on disk.`);

  let copied = 0;
  let alreadyExists = 0;
  let missing = 0;

  function ensureFile(url: string) {
    const filename = path.basename(url);
    const targetPath = path.join(uploadDir, filename);

    if (fs.existsSync(targetPath)) {
      alreadyExists++;
      return;
    }

    const m = filename.match(/^(img_\d+_).*\.([^.]+)$/i);
    if (m) {
      const prefix = m[1].toLowerCase();
      const existing = prefixMap.get(prefix);
      if (existing) {
        const sourcePath = path.join(uploadDir, existing);
        fs.copyFileSync(sourcePath, targetPath);
        copied++;
        console.log(`Copied: ${existing} -> ${filename}`);
        return;
      }
    }

    console.warn(`Could not resolve file on disk for URL: ${url}`);
    missing++;
  }

  for (const q of questions) {
    for (const m of q.media) {
      ensureFile(m.url);
    }
    for (const e of q.explanationImages) {
      ensureFile(e.url);
    }
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = imgRegex.exec(q.questionText)) !== null) {
      if (match[1].includes('approach-to-histology')) {
        ensureFile(match[1]);
      }
    }
    while ((match = imgRegex.exec(q.explanation)) !== null) {
      if (match[1].includes('approach-to-histology')) {
        ensureFile(match[1]);
      }
    }
  }

  console.log(`\nHistology media sync complete:`);
  console.log(`Already existed: ${alreadyExists}`);
  console.log(`Copied aliases created: ${copied}`);
  console.log(`Missing: ${missing}`);

  await prisma.$disconnect();
}

main().catch(console.error);
