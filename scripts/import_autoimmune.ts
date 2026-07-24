import { prisma } from '../src/lib/db';
import fs from 'fs';
import * as cheerio from 'cheerio';
const mammoth = require('mammoth');
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadToS3(filename: string, buffer: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return `https://${process.env.NEXT_PUBLIC_CDN_DOMAIN}/${filename}`;
}

async function run() {
  console.log('Extracting text and uploading images to S3...');
  
  const options = {
    convertImage: mammoth.images.imgElement(function(image: any) {
      return image.read().then(async function(imageBuffer: Buffer) {
        const ext = image.contentType.split('/')[1] || 'png';
        const filename = `qbank-images/${crypto.randomUUID()}.${ext}`;
        console.log(`Uploading image ${filename}...`);
        const url = await uploadToS3(filename, imageBuffer, image.contentType);
        return { src: url };
      });
    })
  };

  const result = await mammoth.convertToHtml({ path: "2026-06-11_Autoimmune_Disease_Qbank_Q1-50_Poojan_V3 (1).docx" }, options);
  let html = result.value;
  console.log('Generated HTML length:', html.length);
  
  const $ = cheerio.load(html);
  const questions: any[] = [];
  let currentQ: any = null;
  let currentSection = '';

  $('body').children().each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');

    const qMatch = text.match(/^Q(\d+)\.\s*(.*)/);
    if (qMatch) {
      if (currentQ) questions.push(currentQ);
      currentQ = {
        number: parseInt(qMatch[1]),
        subtopic: qMatch[2] || 'Unknown',
        vignette: '',
        options: [],
        correctAnswer: 'A',
        explanation: '',
        currentOptLetter: null,
      };
      currentSection = '';
      return;
    }

    if (!currentQ) return;

    if (text.toLowerCase() === 'clinical vignette') {
      currentSection = 'vignette';
      return;
    } else if (text.toLowerCase() === 'answer choices') {
      currentSection = 'options';
      return;
    } else if (text.toLowerCase() === 'concept explanation' || text.toLowerCase() === 'explanation') {
      currentSection = 'explanation';
      return;
    } else if (text.toLowerCase().includes('why each option is right or wrong')) {
      currentSection = 'option-explanations';
      return;
    }

    if (text.startsWith('Answer:')) {
      const ansMatch = text.match(/Answer:\s*([A-E])/i);
      if (ansMatch) {
        currentQ.correctAnswer = ansMatch[1].toUpperCase();
      }
      return;
    }

    if (currentSection === 'options' && (el as any).tagName === 'table') {
      $(el).find('tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length >= 2) {
          const letter = $(tds[0]).text().trim().toUpperCase();
          if (letter.match(/^[A-E]$/)) {
            let htmlContent = $(tds[1]).html() || '';
            htmlContent = htmlContent.trim().replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim();
            currentQ.options.push({ id: letter, text: htmlContent });
          }
        }
      });
      return;
    }

    const htmlContent = $.html(el);
    if (currentSection === 'vignette') {
      currentQ.vignette += (currentQ.vignette ? '\n' : '') + htmlContent;
    } else if (currentSection === 'explanation') {
      currentQ.explanation += (currentQ.explanation ? '\n' : '') + htmlContent;
    } else if (currentSection === 'option-explanations') {
      const optMatch = text.match(/^([A-E])\.\s*(.*)/i);
      if (optMatch) {
        currentQ.currentOptLetter = optMatch[1].toUpperCase();
      }
      if (currentQ.currentOptLetter) {
        const opt = currentQ.options.find((o: any) => o.id === currentQ.currentOptLetter);
        if (opt) {
          opt.explanation = (opt.explanation ? opt.explanation + '\n' : '') + htmlContent;
        }
      }
    }
  });

  if (currentQ) questions.push(currentQ);
  console.log(`Parsed ${questions.length} questions.`);

  console.log('Upserting QBank...');
  const qbank = await prisma.qBank.upsert({
    where: { slug: 'autoimmune-disease' },
    update: {},
    create: {
      title: 'Autoimmune Disease',
      slug: 'autoimmune-disease',
      qbankCode: 'AUTOIMMUNE',
      description: 'A comprehensive 50-question block covering connective tissue and systemic rheumatic diseases.',
      specialtyTag: 'Rheumatology',
      price: 1999,
      totalQuestions: questions.length,
      isActive: true,
    }
  });

  console.log('Clearing old questions for this QBank...');
  await prisma.userProgress.deleteMany({ where: { qbankId: qbank.id } });
  await prisma.question.deleteMany({ where: { qbankId: qbank.id } });

  console.log('Inserting questions...');
  let inserted = 0;
  for (const q of questions) {
    // Extract images from vignette to create QuestionMedia
    const $v = cheerio.load(q.vignette || '');
    const media: any[] = [];
    $v('img').each((_, imgEl) => {
      const src = $v(imgEl).attr('src');
      if (src) {
        media.push({ type: 'IMAGE', url: src });
      }
    });
    // Removed: $v('img').remove(); so they render inline
    const cleanVignette = $v.html() || '<p>Missing vignette</p>';

    const opt = q.options.find((o: any) => o.id === q.correctAnswer);
    const correctOptionId = opt ? opt.id : q.options[0]?.id || 'A';
    
    console.log(`Inserting question ${q.number} with ${media.length} media items...`);
    try {
      await prisma.question.create({
      data: {
        qid: `AUTOIMMUNE-Q${q.number}-${crypto.randomBytes(4).toString('hex')}`,
        qbankId: qbank.id,
        questionText: cleanVignette,
        options: q.options.length > 0 ? q.options : [{ id: 'A', text: 'Missing options' }],
        correctAnswer: correctOptionId,
        explanation: q.explanation || '<p>No explanation</p>',
        difficulty: 'medium',
        subtopic: q.subtopic,
        media: {
          create: media.map((m: any, i: number) => ({
            type: m.type,
            url: m.url,
            order: i
          }))
        }
      }
    });
    } catch (e) {
      console.error(`Failed on question ${q.number}:`, e);
    }
    inserted++;
  }

  console.log(`Successfully inserted ${inserted} questions!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
