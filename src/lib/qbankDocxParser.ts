import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

export interface ParsedQuestion {
  num: number;
  qid: string;
  title: string;
  questionText: string;
  vignetteImages: string[];
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string | null;
  }[];
  correctAnswer: string;
  explanation: string;
  explanationImages: string[];
  videoUrl?: string | null;
}

export interface ParseOptions {
  qbankSlug: string;
  qbankCode?: string;
  videoMapping?: Record<number, { title: string; url: string }>;
}

export async function parseQbankDocx(
  fileBuffer: Buffer,
  options: ParseOptions
): Promise<ParsedQuestion[]> {
  const { qbankSlug, qbankCode = 'HIST', videoMapping = {} } = options;

  // 1. Ensure target upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'qbank', qbankSlug);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 2. Convert DOCX with mammoth, extracting images
  let imageCounter = 0;
  const mammothResult = await mammoth.convertToHtml(
    { buffer: fileBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image: any) => {
        imageCounter++;
        const extension = image.contentType.split('/')[1] || 'png';
        const filename = `img_${imageCounter}_${Date.now()}.${extension}`;
        const filePath = path.join(uploadDir, filename);

        const imageBuffer = await image.read();
        fs.writeFileSync(filePath, imageBuffer);

        return {
          src: `/uploads/qbank/${qbankSlug}/${filename}`,
        };
      }),
    }
  );

  const fullHtml = mammothResult.value;

  // 3. Match questions strictly matching Q<number>.
  const qRegex = /<h1[^>]*>(?:<a[^>]*><\/a>)?<strong>Q(\d+)\.\s*([^<]+)<\/strong><\/h1>/gi;
  const matches: Array<{ num: number; title: string; index: number; fullMatch: string }> = [];

  let m: RegExpExecArray | null;
  while ((m = qRegex.exec(fullHtml)) !== null) {
    matches.push({
      num: parseInt(m[1], 10),
      title: m[2].trim(),
      index: m.index,
      fullMatch: m[0],
    });
  }

  // Fallback: If no h1 strong Q matches, search more broadly
  if (matches.length === 0) {
    const looseRegex = /Q(\d+)\.\s*([^<\n\r]+)/gi;
    while ((m = looseRegex.exec(fullHtml)) !== null) {
      const num = parseInt(m[1], 10);
      if (!matches.some((item) => item.num === num)) {
        matches.push({
          num,
          title: m[2].trim(),
          index: m.index,
          fullMatch: m[0],
        });
      }
    }
  }

  matches.sort((a, b) => a.num - b.num);

  const questions: ParsedQuestion[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    const startIndex = current.index + current.fullMatch.length;
    const endIndex = next ? next.index : fullHtml.length;
    const qHtml = fullHtml.slice(startIndex, endIndex);

    const $ = cheerio.load(qHtml);

    // 1. Locate Answer Choices boundary
    let answerChoicesElem: any = null;
    $('h1, h2, h3, h4').each((_: any, elem: any) => {
      const text = $(elem).text().trim();
      if (/answer\s*choices/i.test(text)) {
        answerChoicesElem = $(elem);
      }
    });

    // 2. Vignette (everything between start and answerChoicesElem)
    const vignetteNodes: any[] = [];
    if (answerChoicesElem) {
      let prev = (answerChoicesElem as any).prev();
      while (prev.length > 0) {
        vignetteNodes.unshift(prev);
        prev = prev.prev();
      }
    } else {
      $('body > *').each((_: any, el: any) => {
        vignetteNodes.push($(el));
      });
    }

    const $vignette = cheerio.load('<div></div>');
    const vignetteImages: string[] = [];

    vignetteNodes.forEach((node) => {
      if (node.is('h1, h2, h3') && /clinical vignette/i.test(node.text())) {
        return; // Skip "Clinical vignette" heading label
      }

      node.find('img').each((_: any, img: any) => {
        const src = $(img).attr('src');
        if (src && !vignetteImages.includes(src)) {
          vignetteImages.push(src);
        }
      });

      if (node.is('img')) {
        const src = node.attr('src');
        if (src && !vignetteImages.includes(src)) {
          vignetteImages.push(src);
        }
      }

      // Add clean paragraph text
      if (node.is('p') || node.is('table')) {
        $vignette('div').append(node.clone());
      }
    });

    const vignetteHtml = $vignette('div').html() || '';

    // 3. Options extraction
    const rawOptions: { id: string; text: string }[] = [];

    // Check table of options first
    if (answerChoicesElem) {
      const optionsTable = (answerChoicesElem as any).nextAll('table').first();
      if (optionsTable.length > 0) {
        optionsTable.find('tr').each((_: any, tr: any) => {
          const cells = $(tr).find('th, td');
          if (cells.length >= 2) {
            const id = $(cells[0]).text().trim().replace(/[^\w]/g, '');
            const htmlContent = $(cells[1]).html()?.trim() || $(cells[1]).text().trim();
            const cleanText = htmlContent.replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim();
            if (id && cleanText) {
              rawOptions.push({ id: id.toUpperCase(), text: cleanText });
            }
          }
        });
      }
    }

    // Fallback: search for A. ..., B. ... paragraphs if table not found
    if (rawOptions.length === 0) {
      $('p').each((_: any, p: any) => {
        const text = $(p).text().trim();
        const m = text.match(/^([A-E])\.\s*(.+)$/i);
        if (m) {
          rawOptions.push({ id: m[1].toUpperCase(), text: m[2].trim() });
        }
      });
    }

    // 4. Correct Answer
    let correctAnswer = 'A';
    const ansMatch =
      qHtml.match(/<strong>Answer:\s*([A-F])<\/strong>/i) ||
      qHtml.match(/Answer:\s*([A-F])/i) ||
      qHtml.match(/(?:correct answer is|choice)\s+([A-E])\b/i);

    if (ansMatch) {
      correctAnswer = ansMatch[1].toUpperCase();
    }

    // 5. Distractor Rationales (Why each option is right or wrong)
    let whyElem: any = null;
    $('h1, h2, h3, h4, p').each((_: any, elem: any) => {
      if (/why each option is right or wrong/i.test($(elem).text())) {
        whyElem = $(elem);
      }
    });

    const optRationales: Record<string, string> = {};
    if (whyElem) {
      let nextNode = (whyElem as any).next();
      while (
        nextNode.length > 0 &&
        !nextNode.is('h1, h2, h3') &&
        !/clinical pearl/i.test(nextNode.text())
      ) {
        const text = nextNode.text().trim();
        const m = text.match(/^([A-E])\.\s*([\s\S]*)/);
        if (m) {
          optRationales[m[1].toUpperCase()] = m[2].trim();
        }
        nextNode = nextNode.next();
      }
    }

    const finalOptions = rawOptions.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.id === correctAnswer,
      explanation: optRationales[opt.id] || null,
    }));

    // 6. Explanation Section
    let explanationElem: any = null;
    $('h1, h2, h3, h4').each((_: any, elem: any) => {
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
      explNodes.forEach((node) => {
        const text = node.text().trim();

        // Medical Tables Styling (clean, standard, non-code)
        if (node.is('table')) {
          node.addClass(
            'qbank-table border-collapse w-full my-6 border border-slate-300 text-xs shadow-xs rounded overflow-hidden select-text'
          );
          node.find('th, td').addClass('border border-slate-300 p-2.5 text-left leading-normal select-text');
          node.find('thead th').addClass('bg-slate-100 font-bold text-slate-900 border-b-2 border-slate-300');
        }

        // Side-by-side Comparative Histology Images
        const innerImgs = node.find('img');
        if (innerImgs.length >= 2) {
          node.addClass('flex flex-wrap items-center justify-center gap-4 my-4');
          innerImgs.each((_: any, img: any) => {
            $expl(img).addClass(
              'max-w-[calc(50%-0.5rem)] min-w-[260px] flex-1 h-auto rounded border border-slate-200 shadow-xs cursor-pointer hover:opacity-95 transition-opacity'
            );
          });
        } else if (innerImgs.length === 1) {
          innerImgs.addClass(
            'max-w-full h-auto rounded border border-slate-200 my-4 shadow-xs cursor-pointer hover:opacity-95 transition-opacity'
          );
        }

        if (node.is('img')) {
          node.addClass(
            'max-w-full h-auto rounded border border-slate-200 my-4 shadow-xs cursor-pointer hover:opacity-95 transition-opacity'
          );
        }

        // Figure captions
        if (node.is('p') && /figure\s*\d+\.\d+:/i.test(text)) {
          node.addClass('text-xs text-slate-500 italic mt-1 mb-6 text-center leading-relaxed select-text');
        }

        // Option rationales paragraphs (A. ..., B. ...)
        if (node.is('p') && /^[A-E]\.\s+/i.test(text)) {
          node.addClass('mb-3 text-sm leading-relaxed p-2.5 rounded border border-slate-100 bg-slate-50/50 select-text');
        }

        $expl('div').append(node.clone());
      });

      // Style Clinical Pearl into clean callout card
      $expl('h1, h2, h3, h4').each((_: any, el: any) => {
        if (/clinical pearl/i.test($expl(el).text().trim())) {
          const nextP = $expl(el).next('p');
          if (nextP.length > 0) {
            const pearlText = nextP.html() || '';
            const card = cheerio.load(`
              <div class="my-6 p-4 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg text-slate-800 text-sm shadow-xs select-text">
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

    questions.push({
      num: current.num,
      qid: `${qbankCode}-${String(current.num).padStart(3, '0')}`,
      title: current.title,
      questionText: vignetteHtml,
      vignetteImages,
      options: finalOptions,
      correctAnswer,
      explanation: explanationHtml,
      explanationImages,
      videoUrl: videoMapping[current.num]?.url || null,
    });
  }

  return questions;
}
