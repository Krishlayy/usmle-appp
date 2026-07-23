const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const mammoth = require('mammoth');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create a Postgres Pool and Prisma adapter only if DATABASE_URL is set
const connectionString = process.env.DATABASE_URL;
let prisma = null;
let pool = null;
if (connectionString) {
  pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  console.warn('DATABASE_URL is not set. Running in dry-run mode — no DB writes will be performed.');
}

async function run() {
  try {
    console.log('Extracting text from docx...');
    const result = await mammoth.extractRawText({ path: "2026-06-11_Autoimmune_Disease_Qbank_Q1-50_Poojan_V3 (1).docx" });
    const raw = result.value;

    console.log('Parsing questions...');
    const questionBlocks = raw.split(/\n(?=Q\d+\.\s*)/).filter(q => q.trim().startsWith('Q'));
    console.log(`Found ${questionBlocks.length} questions.`);

    console.log('Ensuring QBank exists...');
    let qbank;
    const previewQuestions = [];

    if (prisma) {
      qbank = await prisma.qBank.upsert({
        where: { slug: 'autoimmune-disease' },
        update: {},
        create: {
          title: 'Autoimmune Disease',
          slug: 'autoimmune-disease',
          qbankCode: 'AUTOIMMUNE',
          description: 'A comprehensive 50-question block covering connective tissue and systemic rheumatic diseases.',
          specialtyTag: 'Rheumatology',
          price: 1999, // $19.99
          totalQuestions: questionBlocks.length,
        }
      });

      console.log(`QBank ID: ${qbank.id}`);

      // Clear existing questions for this QBank so we can re-run safely
      await prisma.question.deleteMany({ where: { qbankId: qbank.id } });
    } else {
      qbank = {
        id: 'local-autoimmune',
        title: 'Autoimmune Disease',
        slug: 'autoimmune-disease',
        qbankCode: 'AUTOIMMUNE',
        description: 'A comprehensive 50-question block covering connective tissue and systemic rheumatic diseases.',
        specialtyTag: 'Rheumatology',
        price: 1999,
        totalQuestions: questionBlocks.length,
      };
      console.log('Dry-run mode: will collect parsed questions and write preview file.');
    }

    console.log('Inserting questions...');
    let insertedCount = 0;

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i];

      const titleMatch = block.match(/^Q\d+\.\s*(.+)/);
      const subtopic = titleMatch ? titleMatch[1].trim() : 'Unknown';

      const vignetteStart = block.indexOf('Clinical vignette');
      const answerChoicesStart = block.indexOf('Answer choices');

      if (vignetteStart === -1 || answerChoicesStart === -1) {
        console.warn(`Could not parse question ${i + 1}. Skipping.`);
        continue;
      }

      const vignette = block.slice(vignetteStart + 'Clinical vignette'.length, answerChoicesStart).trim();

      const answerStart = block.indexOf('Answer:');
      const choicesStr = block.slice(answerChoicesStart + 'Answer choices'.length, answerStart).trim();

      const answerMatch = block.match(/Answer:\s*([A-E])/);
      const correctLetter = answerMatch ? answerMatch[1] : 'A'; // fallback

      const explanationStart = block.indexOf('Concept explanation');
      let explanation = '';
      if (explanationStart !== -1) {
        explanation = block.slice(explanationStart + 'Concept explanation'.length).trim();
      }

      const optionLines = choicesStr.split('\n').map(l => l.trim()).filter(l => l);
      const options = [];
      let currentOpt = null;

      for (let j = 0; j < optionLines.length; j++) {
        const line = optionLines[j];
        if (/^[A-E]$/.test(line)) {
          currentOpt = { id: line, text: '' };
          options.push(currentOpt);
        } else if (line === '⊘' || line === '✓' || line === '~') {
          // ignore symbols
        } else {
          if (currentOpt) {
            currentOpt.text += (currentOpt.text ? '\n' : '') + line;
          }
        }
      }

      if (options.length === 0) {
        console.warn(`Could not parse options for question ${i + 1}. Skipping.`);
        continue;
      }

      const correctOptionId = options.find(o => o.id === correctLetter)?.id || options[0].id;

      if (prisma) {
        await prisma.question.create({
          data: {
            qbankId: qbank.id,
            questionText: vignette,
            options: options,
            correctAnswer: correctOptionId,
            explanation: explanation || 'No explanation provided.',
            difficulty: 'medium',
            subtopic: subtopic.substring(0, 50),
          }
        });
        insertedCount++;
      } else {
        previewQuestions.push({
          qbankId: qbank.id,
          questionText: vignette,
          options: options,
          correctAnswer: correctOptionId,
          explanation: explanation || 'No explanation provided.',
          difficulty: 'medium',
          subtopic: subtopic.substring(0, 50),
        });
        insertedCount++;
      }
    }

    console.log(`Successfully processed ${insertedCount} questions.`);

    if (prisma) {
      await prisma.qBank.update({ where: { id: qbank.id }, data: { totalQuestions: insertedCount } });
    } else {
      const preview = { qbank, questions: previewQuestions };
      fs.writeFileSync('import_preview.json', JSON.stringify(preview, null, 2));
      console.log('Wrote import_preview.json with parsed questions.');
    }

  } catch (err) {
    console.error('Error importing QBank:', err);
  } finally {
    if (prisma) await prisma.$disconnect();
    if (pool) await pool.end();
  }
}

run();
