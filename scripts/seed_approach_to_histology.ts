import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { prisma } from '../src/lib/db';

const videoMapping: Record<number, { url: string; title: string }> = {
  1: { url: '/videos/histology/video_1_the_colour_room.mov', title: 'The Colour Room' },
  16: { url: '/videos/histology/video_1_the_colour_room.mov', title: 'The Colour Room' },
  48: { url: '/videos/histology/video_1_the_colour_room.mov', title: 'The Colour Room' },
  49: { url: '/videos/histology/video_1_the_colour_room.mov', title: 'The Colour Room' },

  4: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mov', title: 'Be So Totally Cool, Read Books' },
  14: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mov', title: 'Be So Totally Cool, Read Books' },
  15: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mov', title: 'Be So Totally Cool, Read Books' },
  40: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mov', title: 'Be So Totally Cool, Read Books' },

  17: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mov', title: 'Three Muscles and a Wire' },
  18: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mov', title: 'Three Muscles and a Wire' },
  19: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mov', title: 'Three Muscles and a Wire' },
  20: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mov', title: 'Three Muscles and a Wire' },

  22: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },
  23: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },
  24: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },
  25: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },
  26: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },
  39: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },
  41: { url: '/videos/histology/video_4_down_the_gut_tube.mov', title: 'Down the Gut Tube' },

  6: { url: '/videos/histology/video_5_the_endocrine_cabinet.mov', title: 'The Endocrine Cabinet' },
  29: { url: '/videos/histology/video_5_the_endocrine_cabinet.mov', title: 'The Endocrine Cabinet' },
  32: { url: '/videos/histology/video_5_the_endocrine_cabinet.mov', title: 'The Endocrine Cabinet' },
  33: { url: '/videos/histology/video_5_the_endocrine_cabinet.mov', title: 'The Endocrine Cabinet' },
  34: { url: '/videos/histology/video_5_the_endocrine_cabinet.mov', title: 'The Endocrine Cabinet' },
  43: { url: '/videos/histology/video_5_the_endocrine_cabinet.mov', title: 'The Endocrine Cabinet' },

  7: { url: '/videos/histology/video_6_seven_up.mov', title: 'SEVEN UP' },
  8: { url: '/videos/histology/video_6_seven_up.mov', title: 'SEVEN UP' },
  9: { url: '/videos/histology/video_6_seven_up.mov', title: 'SEVEN UP' },
  10: { url: '/videos/histology/video_6_seven_up.mov', title: 'SEVEN UP' },
  37: { url: '/videos/histology/video_6_seven_up.mov', title: 'SEVEN UP' },
  38: { url: '/videos/histology/video_6_seven_up.mov', title: 'SEVEN UP' }
};

interface ParsedQuestion {
  num: number;
  qid: string;
  title: string;
  vignetteHtml: string;
  vignetteImages: string[];
  options: { id: string; text: string; explanation?: string | null }[];
  correctAnswer: string;
  explanationHtml: string;
  explanationImages: string[];
  videoUrl: string | null;
}

function parseAllQuestions(): ParsedQuestion[] {
  const htmlPath = path.join(__dirname, 'converted_histology.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Strict regex matching ONLY authentic Question headers (Q1 to Q50)
  const qRegex = /<h1[^>]*>(?:<a[^>]*><\/a>)?<strong>Q(\d+)\.\s*([^<]+)<\/strong><\/h1>/gi;
  let match: RegExpExecArray | null;
  const qHeaders: { num: number; title: string; start: number; matchLen: number }[] = [];

  while ((match = qRegex.exec(html)) !== null) {
    qHeaders.push({
      num: parseInt(match[1]),
      title: match[2].trim(),
      start: match.index,
      matchLen: match[0].length
    });
  }

  console.log(`Discovered ${qHeaders.length} question sections in converted_histology.html`);
  if (qHeaders.length !== 50) {
    throw new Error(`Expected exactly 50 questions, found ${qHeaders.length}`);
  }

  const results: ParsedQuestion[] = [];

  for (let i = 0; i < qHeaders.length; i++) {
    const current = qHeaders[i];
    const nextStart = (i < qHeaders.length - 1) ? qHeaders[i + 1].start : html.length;
    const qHtml = html.slice(current.start + current.matchLen, nextStart);
    const $ = cheerio.load(qHtml);

    // 1. Locate Answer Choices section
    let answerChoicesElem: any = null;
    $('h1, h2, h3, h4, p').each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      if (/^answer\s*choices$/i.test(text)) {
        if (!answerChoicesElem) answerChoicesElem = $(elem);
      }
    });

    if (!answerChoicesElem) {
      throw new Error(`Critical: Question Q${current.num} missing 'Answer choices' section!`);
    }

    // 2. Clinical Vignette elements (all siblings preceding Answer Choices)
    const vignetteNodes: any[] = [];
    let curr = (answerChoicesElem as any).prev();
    while (curr.length > 0) {
      vignetteNodes.unshift(curr);
      curr = curr.prev();
    }

    const $vignette = cheerio.load('<div></div>');
    vignetteNodes.forEach(node => {
      if (/clinical\s*vignette/i.test(node.text().trim()) && node.is('h1, h2, h3, h4')) {
        return;
      }
      // Add responsive and cursor classes to any image in the vignette
      node.find('img').each((_: any, img: any) => {
        $vignette(img).addClass('max-w-md w-full h-auto rounded border border-slate-300 my-4 shadow-sm cursor-pointer exhibit-trigger');
      });
      if (node.is('img')) {
        node.addClass('max-w-md w-full h-auto rounded border border-slate-300 my-4 shadow-sm cursor-pointer exhibit-trigger');
      }
      $vignette('div').append(node.clone());
    });

    // Collect vignette images (exhibits)
    const vignetteImages: string[] = [];
    $vignette('img').each((_: any, img: any) => {
      const src = $vignette(img).attr('src');
      if (src && !vignetteImages.includes(src)) {
        vignetteImages.push(src);
      }
    });

    // 3. Parse options table
    const optionsTable = (answerChoicesElem as any).nextAll('table').first();
    const rawOptions: { id: string; text: string }[] = [];
    if (optionsTable.length > 0) {
      optionsTable.find('tr').each((_: any, tr: any) => {
        const cells = $(tr).find('th, td');
        if (cells.length >= 2) {
          const id = $(cells[0]).text().trim().replace(/[^\w]/g, '');
          const htmlContent = $(cells[1]).html()?.trim() || $(cells[1]).text().trim();
          const cleanText = htmlContent.replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim();
          if (id && cleanText) {
            rawOptions.push({ id, text: cleanText });
          }
        }
      });
    }

    // 4. Correct Answer
    let correctAnswer = '';
    const ansMatch = qHtml.match(/<strong>Answer:\s*([A-F])<\/strong>/i) || 
                     qHtml.match(/Answer:\s*([A-F])/i);
    if (ansMatch) {
      correctAnswer = ansMatch[1].toUpperCase();
    } else {
      throw new Error(`Critical: Question Q${current.num} missing answer indicator!`);
    }

    // 5. Why each option is right or wrong (Distractor rationales)
    let whyElem: any = null;
    $('h1, h2, h3, h4, p').each((_: any, elem: any) => {
      if (/why each option is right or wrong/i.test($(elem).text())) {
        whyElem = $(elem);
      }
    });

    const optRationales: Record<string, string> = {};
    if (whyElem) {
      let nextNode = (whyElem as any).next();
      while (nextNode.length > 0 && !nextNode.is('h1, h2, h3') && !/clinical pearl/i.test(nextNode.text())) {
        const text = nextNode.text().trim();
        const m = text.match(/^([A-E])\.\s*([\s\S]*)/);
        if (m) {
          optRationales[m[1]] = m[2].trim();
        }
        nextNode = nextNode.next();
      }
    }

    // Attach rationales to options
    const finalOptions = rawOptions.map(opt => ({
      id: opt.id,
      text: opt.text,
      explanation: optRationales[opt.id] || null
    }));

    // 6. Concept Explanation and onwards
    let explanationElem: any = null;
    $('h3, h2, h4').each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      if (/concept\s*explanation/i.test(text) || /^explanation$/i.test(text)) {
        if (!explanationElem && answerChoicesElem && $(elem).index() > answerChoicesElem.index()) {
          explanationElem = $(elem);
        }
      }
    });

    let explanationHtml = '';
    const explanationImages: string[] = [];

    if (explanationElem) {
      const explNodes: any[] = [];
      let nextNode = (explanationElem as any).next();
      while (nextNode.length > 0) {
        explNodes.push(nextNode);
        nextNode = nextNode.next();
      }

      const $expl = cheerio.load('<div></div>');
      explNodes.forEach(node => {
        const text = node.text().trim();

        // Section Headings Styling
        if (node.is('h1, h2, h3, h4')) {
          if (/why each option is right or wrong/i.test(text)) {
            node.addClass('text-base font-bold text-[#003366] mt-8 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2');
          } else if (/clinical pearl/i.test(text)) {
            node.addClass('text-base font-bold text-amber-800 mt-8 mb-2 flex items-center gap-2');
          } else if (/references/i.test(text)) {
            node.addClass('text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-2 border-t border-slate-200 pt-4');
          } else {
            node.addClass('text-sm font-bold text-slate-900 mt-6 mb-2');
          }
        }

        // Medical Tables Styling
        if (node.is('table')) {
          node.addClass('qbank-table border-collapse w-full my-6 border border-slate-300 text-xs shadow-xs rounded overflow-hidden');
          node.find('th, td').addClass('border border-slate-300 p-2.5 text-left leading-normal');
          node.find('thead th').addClass('bg-slate-100 font-bold text-slate-900 border-b-2 border-slate-300');
        }

        // Paragraph with multiple images (e.g. side-by-side figures Left & Right)
        const innerImgs = node.find('img');
        if (innerImgs.length >= 2) {
          node.addClass('flex flex-wrap items-center justify-center gap-4 my-4');
          innerImgs.each((_: any, img: any) => {
            $expl(img).addClass('max-w-[calc(50%-0.5rem)] min-w-[260px] flex-1 h-auto rounded border border-slate-200 shadow-xs cursor-pointer hover:opacity-95 transition-opacity');
          });
        } else if (innerImgs.length === 1) {
          innerImgs.addClass('max-w-full h-auto rounded border border-slate-200 my-4 shadow-xs cursor-pointer hover:opacity-95 transition-opacity');
        }

        if (node.is('img')) {
          node.addClass('max-w-full h-auto rounded border border-slate-200 my-4 shadow-xs cursor-pointer hover:opacity-95 transition-opacity');
        }

        // Figure captions
        if (node.is('p') && /figure\s*\d+\.\d+:/i.test(text)) {
          node.addClass('text-xs text-slate-500 italic mt-1 mb-6 text-center leading-relaxed');
        }

        // Option rationales paragraphs (A. ..., B. ...)
        if (node.is('p') && /^[A-E]\.\s+/i.test(text)) {
          node.addClass('mb-3 text-sm leading-relaxed p-2.5 rounded border border-slate-100 bg-slate-50/50');
        }

        $expl('div').append(node.clone());
      });

      // Style Clinical Pearl section into a high-yield callout card
      $expl('h1, h2, h3, h4').each((_: any, el: any) => {
        if (/clinical pearl/i.test($expl(el).text().trim())) {
          const nextP = $expl(el).next('p');
          if (nextP.length > 0) {
            const pearlText = nextP.html() || '';
            const card = cheerio.load(`
              <div class="my-6 p-4 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg text-slate-800 text-sm shadow-xs">
                <div class="font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <span class="text-amber-600">⭐</span> High-Yield Clinical Pearl
                </div>
                <div class="leading-relaxed">${pearlText}</div>
              </div>
            `)('div');
            $expl(el).replaceWith(card);
            nextP.remove();
          }
        }
      });

      // Collect explanation images
      $expl('img').each((_: any, img: any) => {
        const src = $expl(img).attr('src');
        if (src && !vignetteImages.includes(src) && !explanationImages.includes(src)) {
          explanationImages.push(src);
        }
      });

      explanationHtml = $expl('div').html() || '';
    }

    const vignetteHtml = $vignette('div').html() || '';

    results.push({
      num: current.num,
      qid: `HIST-${String(current.num).padStart(3, '0')}`,
      title: current.title,
      vignetteHtml,
      vignetteImages,
      options: finalOptions,
      correctAnswer,
      explanationHtml,
      explanationImages,
      videoUrl: videoMapping[current.num]?.url || null
    });
  }

  return results;
}

async function main() {
  console.log('===============================================================');
  console.log('RE-SEEDING APPROACH TO HISTOLOGY (PERFECTED EXPLANATION STYLING)');
  console.log('===============================================================');

  const parsed = parseAllQuestions();
  console.log(`Successfully parsed all ${parsed.length} questions.`);

  console.log('\nCleaning up existing questions and re-inserting...');
  
  // Find Approach to Histology QBank
  let qbank = await prisma.qBank.findFirst({
    where: { slug: 'approach-to-histology' }
  });

  if (!qbank) {
    qbank = await prisma.qBank.create({
      data: {
        title: 'Approach to Histology',
        slug: 'approach-to-histology',
        qbankCode: 'HIST',
        price: 4900,
        currency: 'USD',
        specialtyTag: 'Pathology & Histology',
        description: 'High-yield USMLE Step 1 histology concepts, tissue preparation artifacts, organ-level microarchitecture, and diagnostic features with integrated video mnemonics.',
        totalQuestions: 50,
        difficulty: 'Intermediate',
        highYieldScore: 9.4,
        boardCoverage: 'USMLE Step 1 & Step 2 CK',
        isActive: true,
        bibliographyTags: ['Histology', 'Pathology', 'USMLE Step 1', 'Tissue Processing', 'Organ Architecture']
      }
    });
  }

  // Clear existing questions for this qbank
  await prisma.userProgress.deleteMany({});
  await prisma.testSession.deleteMany({});
  await prisma.flashcard.deleteMany({});
  await prisma.highlight.deleteMany({});
  await prisma.questionIssue.deleteMany({});
  await prisma.questionImage.deleteMany({});
  await prisma.questionMedia.deleteMany({});
  await prisma.question.deleteMany({ where: { qbankId: qbank.id } });

  console.log(`Inserting ${parsed.length} questions...`);

  let totalMediaCount = 0;
  let totalExplImgCount = 0;

  for (const q of parsed) {
    const createdQuestion = await prisma.question.create({
      data: {
        qid: q.qid,
        qbankId: qbank.id,
        questionText: q.vignetteHtml,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanationHtml,
        difficulty: 'medium',
        subtopic: q.title,
        imageUrl: q.vignetteImages[0] || null,
        videoUrl: q.videoUrl,
        videoPosition: 'TOP',
        status: 'PUBLISHED',
        tags: ['Histology', 'Pathology', q.title]
      }
    });

    if (q.vignetteImages.length > 0) {
      for (let idx = 0; idx < q.vignetteImages.length; idx++) {
        await prisma.questionMedia.create({
          data: {
            questionId: createdQuestion.id,
            type: 'IMAGE',
            url: q.vignetteImages[idx],
            caption: `${q.title} - Exhibit ${idx + 1}`,
            placement: 'TOP',
            displaySize: 'LARGE',
            order: idx
          }
        });
        totalMediaCount++;
      }
    }

    if (q.explanationImages.length > 0) {
      for (let idx = 0; idx < q.explanationImages.length; idx++) {
        await prisma.questionImage.create({
          data: {
            questionId: createdQuestion.id,
            url: q.explanationImages[idx],
            caption: `Figure ${idx + 1}`,
            order: idx
          }
        });
        totalExplImgCount++;
      }
    }

    console.log(`✓ Inserted Q${q.num} (${q.qid}): "${q.title}" (Exhibits: ${q.vignetteImages.length}, ExplImgs: ${q.explanationImages.length}, Video: ${q.videoUrl ? 'Yes' : 'No'})`);
  }

  const actualCount = await prisma.question.count({
    where: { qbankId: qbank.id }
  });
  await prisma.qBank.update({
    where: { id: qbank.id },
    data: { totalQuestions: actualCount }
  });

  console.log('\n===============================================================');
  console.log(`SUCCESS: Re-seeded all ${actualCount} questions with enhanced explanations!`);
  console.log('===============================================================');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
