import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'usmle-app-images-2026';

// Helper to upload image to S3
async function uploadImageToS3(imageBuffer: Buffer, contentType: string): Promise<string> {
  const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
  const ext = contentType.split('/')[1] || 'png';
  const key = `qbank-images/${hash}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
    })
  );

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

async function parseDocx(filePath: string) {
  console.log(`Starting to parse ${filePath}...`);
  
  // 1. Convert DOCX to HTML and upload images
  const result = await mammoth.convertToHtml(
    { path: filePath },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const imageBuffer = await image.read();
        const url = await uploadImageToS3(imageBuffer, image.contentType);
        console.log(`Uploaded image to ${url}`);
        return { src: url };
      }),
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "table => table",
      ]
    }
  );

  const html = result.value;
  console.log('HTML Conversion complete. Parsing structure...');

  const $ = cheerio.load(html);
  const questions: any[] = [];
  let currentQuestion: any = null;
  let currentMode = '';

  $('body').children().each((_, el) => {
    const tagName = ((el as any).tagName || '').toLowerCase();
    const $el = $(el);

    if (tagName === 'h1') {
      if (currentQuestion) questions.push(currentQuestion);
      const text = $el.text();
      const match = text.match(/Q(\d+)\.\s+(.*)/);
      currentQuestion = {
        qid: match ? `Q${match[1]}` : `Q-UNKNOWN`,
        title: match ? match[2].trim() : text.trim(),
        vignette: '',
        options: [],
        correctAnswer: '',
        conceptExplanation: '',
        optionExplanations: {},
        references: ''
      };
      currentMode = 'title';
      return;
    }

    if (!currentQuestion) return;

    if (tagName === 'h3') {
      const headerText = $el.text().toLowerCase().trim();
      if (headerText.includes('clinical vignette')) currentMode = 'vignette';
      else if (headerText.includes('answer choices')) currentMode = 'options';
      else if (headerText.includes('concept explanation')) currentMode = 'concept';
      else if (headerText.includes('why each option')) currentMode = 'why_options';
      else currentMode = 'unknown';
      return;
    }

    // Capture explicit "Answer: X"
    if (tagName === 'p' && $el.text().includes('Answer:')) {
      const text = $el.text().trim();
      const match = text.match(/Answer:\s*([A-Z])/i);
      if (match) {
        currentQuestion.correctAnswer = match[1].toUpperCase();
      }
      return;
    }

    switch (currentMode) {
      case 'vignette':
        currentQuestion.vignette += $.html(el);
        break;
      case 'options':
        if (tagName === 'table') {
          $el.find('tr').each((i, row) => {
            const tds = $(row).find('td');
            if (tds.length >= 2) {
              const letter = $(tds[0]).text().trim().replace(/[^A-Z]/g, '');
              const textHtml = $(tds[1]).html() || '';
              if (letter) {
                currentQuestion.options.push({
                  id: letter,
                  text: textHtml.trim()
                });
              }
            }
          });
        }
        break;
      case 'concept':
        currentQuestion.conceptExplanation += $.html(el);
        break;
      case 'why_options':
        if (tagName === 'p') {
          const text = $el.text().trim();
          if (text.startsWith('References:')) {
            currentQuestion.references += $.html(el);
          } else {
            // Find which option this explains
            const optionMatch = text.match(/^([A-Z])\./);
            if (optionMatch) {
              const letter = optionMatch[1];
              // Extract the HTML content but strip the leading "A. "
              let innerHtml = $el.html() || '';
              innerHtml = innerHtml.replace(/<strong>[A-Z]\.\s*<\/strong>/, '');
              currentQuestion.optionExplanations[letter] = innerHtml.trim();
            } else {
               // If no explicit letter, append to the last one or just treat as reference
               if (text.includes('References:')) {
                  currentQuestion.references += $.html(el);
               }
            }
          }
        }
        break;
    }
  });

  if (currentQuestion) questions.push(currentQuestion);

  console.log(`Parsed ${questions.length} questions. Inserting to DB...`);

  // Update or Create QBank
  const qbankCode = "AUTOIMMUNE-01";
  const slug = "autoimmune-disease-qbank";
  const title = "Autoimmune Disease QBank";
  
  let qbank = await prisma.qBank.findUnique({ where: { slug } });
  if (!qbank) {
    qbank = await prisma.qBank.create({
      data: {
        title,
        slug,
        qbankCode,
        description: "Comprehensive question bank covering autoimmune diseases.",
        specialtyTag: "Rheumatology & Immunology",
        price: 4900,
        totalQuestions: questions.length,
        difficulty: "Intermediate",
        isActive: true,
      }
    });
    console.log(`Created new QBank: ${qbank.title}`);
  } else {
    console.log(`Found existing QBank: ${qbank.title}`);
    await prisma.qBank.update({
      where: { id: qbank.id },
      data: { totalQuestions: questions.length }
    });
  }

  // Insert Questions
  for (const q of questions) {
    const finalOptions = q.options.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      explanation: q.optionExplanations[opt.id] || null
    }));

    // Generate unique qid
    const dbQid = `${qbankCode}-${q.qid}`;
    
    const combinedExplanation = q.conceptExplanation + (q.references ? `<div class="mt-4 border-t pt-4 text-sm text-gray-500">${q.references}</div>` : '');

    const data = {
      qbankId: qbank.id,
      questionText: q.vignette,
      options: finalOptions,
      correctAnswer: q.correctAnswer || 'A', // Fallback
      explanation: combinedExplanation,
      difficulty: 'medium',
      subtopic: q.title,
      status: 'PUBLISHED'
    };

    const existingQ = await prisma.question.findUnique({ where: { qid: dbQid } });
    if (existingQ) {
      await prisma.question.update({
        where: { id: existingQ.id },
        data
      });
      console.log(`Updated question ${dbQid}`);
    } else {
      await prisma.question.create({
        data: {
          ...data,
          qid: dbQid,
        }
      });
      console.log(`Created question ${dbQid}`);
    }
  }

  console.log('Finished processing QBank!');
}

const arg = process.argv[2];
if (!arg) {
  console.error("Please provide the path to the docx file");
  process.exit(1);
}

parseDocx(arg).catch(e => {
  console.error(e);
  process.exit(1);
});
