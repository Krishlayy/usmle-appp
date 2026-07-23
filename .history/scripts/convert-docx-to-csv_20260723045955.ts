import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import mammoth from 'mammoth';

const INPUT_DOCX = '2026-06-11_Autoimmune_Disease_Qbank_Q1-50_Poojan_V3 (1).docx';
const OUTPUT_CSV = 'autoimmune-questions.csv';

function escapeCsv(value: string) {
  const escaped = value.replace(/"/g, '""').replace(/\r\n|\n|\r/g, ' ');
  return `"${escaped}"`;
}

function asJson(value: unknown) {
  return JSON.stringify(value);
}

async function run() {
  const inputPath = path.resolve(process.cwd(), INPUT_DOCX);
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const result = await mammoth.convertToHtml({ path: inputPath });
  const $ = cheerio.load(result.value);

  const rows: Array<Record<string, any>> = [];
  let currentQ: any = null;
  let currentSection: 'vignette' | 'options' | 'explanation' | 'option-explanations' | '' = '';

  function pushCurrentQ() {
    if (currentQ) {
      if (!currentQ.questionText && currentQ.vignette) {
        currentQ.questionText = currentQ.vignette;
      }
      rows.push({
        qid: currentQ.qid || '',
        qbankId: '',
        questionText: currentQ.questionText || '',
        explanation: currentQ.explanation || '',
        options: currentQ.options.map((opt: any) => ({ id: opt.id, text: opt.text, explanation: opt.explanation || null })),
        correctAnswer: currentQ.correctAnswer || '',
        acceptableAnswers: [],
        tags: [],
        difficulty: 'medium',
        subtopic: currentQ.subtopic || '',
        imageUrl: '',
        videoUrl: '',
        videoPosition: 'TOP',
        youtubeId: '',
        status: 'PUBLISHED',
        media: [],
      });
    }
    currentQ = null;
    currentSection = '';
  }

  $('body').children().each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const normalized = text.trim().toLowerCase();
    const qMatch = text.match(/^Q\s*(\d+)\.\s*(.*)/i);

    if (qMatch) {
      pushCurrentQ();
      currentQ = {
        qid: `AUTOIMMUNE-Q${qMatch[1]}`,
        subtopic: qMatch[2] || '',
        questionText: '',
        vignette: '',
        explanation: '',
        options: [],
        correctAnswer: '',
      };
      currentSection = '';
      return;
    }

    if (!currentQ) {
      return;
    }

    if (normalized === 'clinical vignette' || normalized === 'clinical vignette:') {
      currentSection = 'vignette';
      return;
    }

    if (normalized === 'answer choices' || normalized === 'answer choices:') {
      currentSection = 'options';
      return;
    }

    if (normalized === 'concept explanation' || normalized === 'explanation' || normalized === 'explanation:') {
      currentSection = 'explanation';
      return;
    }

    if (normalized.includes('why each option is right or wrong') || normalized === 'option explanations' || normalized === 'option explanations:') {
      currentSection = 'option-explanations';
      return;
    }

    if (/^answer:\s*[a-e]$/i.test(normalized)) {
      const match = normalized.match(/^answer:\s*([a-e])/i);
      if (match) {
        currentQ.correctAnswer = match[1].toUpperCase();
      }
      return;
    }

    if (currentSection === 'options' && el.tagName === 'table') {
      $(el).find('tr').each((_, tr) => {
        const cells = $(tr).find('td');
        if (cells.length >= 2) {
          const letter = $(cells[0]).text().trim().toUpperCase();
          const htmlContent = $(cells[1]).html()?.trim() ?? '';
          if (letter.match(/^[A-E]$/)) {
            currentQ.options.push({ id: letter, text: htmlContent, explanation: null });
          }
        }
      });
      return;
    }

    if (currentSection === 'options' && el.tagName !== 'table') {
      const lineMatch = text.match(/^([A-E])\.?\s+(.*)$/i);
      if (lineMatch) {
        currentQ.options.push({ id: lineMatch[1].toUpperCase(), text: lineMatch[2].trim(), explanation: null });
        return;
      }
    }

    const htmlContent = $.html(el).trim();
    if (currentSection === 'vignette') {
      currentQ.vignette += (currentQ.vignette ? '\n' : '') + htmlContent;
      return;
    }

    if (currentSection === 'explanation') {
      currentQ.explanation += (currentQ.explanation ? '\n' : '') + htmlContent;
      return;
    }

    if (currentSection === 'option-explanations') {
      const explanationMatch = text.match(/^([A-E])\.?\s*(.*)$/i);
      if (explanationMatch) {
        const letter = explanationMatch[1].toUpperCase();
        const option = currentQ.options.find((o: any) => o.id === letter);
        if (option) {
          option.explanation = (option.explanation ? option.explanation + '\n' : '') + htmlContent;
        }
        return;
      }
      // catch continued explanation paragraphs
      const lastOption = currentQ.options[currentQ.options.length - 1];
      if (lastOption) {
        lastOption.explanation = (lastOption.explanation ? lastOption.explanation + '\n' : '') + htmlContent;
      }
      return;
    }

    // Fallback: if there is no section label and the line looks like a question number description,
    // ignore or append to vignette if no content exists yet.
    if (!currentQ.questionText && !currentQ.vignette && normalized.length > 0) {
      currentQ.vignette += htmlContent;
    }
  });

  pushCurrentQ();

  if (rows.length === 0) {
    throw new Error('No questions were parsed from the document.');
  }

  const headers = [
    'qid',
    'qbankId',
    'questionText',
    'explanation',
    'options',
    'correctAnswer',
    'acceptableAnswers',
    'tags',
    'difficulty',
    'subtopic',
    'imageUrl',
    'videoUrl',
    'videoPosition',
    'youtubeId',
    'status',
    'media',
  ];

  const csv = [headers.join(',')];
  for (const row of rows) {
    const line = [
      escapeCsv(row.qid),
      escapeCsv(row.qbankId),
      escapeCsv(row.questionText),
      escapeCsv(row.explanation),
      escapeCsv(asJson(row.options)),
      escapeCsv(row.correctAnswer),
      escapeCsv(asJson(row.acceptableAnswers)),
      escapeCsv(asJson(row.tags)),
      escapeCsv(row.difficulty),
      escapeCsv(row.subtopic),
      escapeCsv(row.imageUrl),
      escapeCsv(row.videoUrl),
      escapeCsv(row.videoPosition),
      escapeCsv(row.youtubeId),
      escapeCsv(row.status),
      escapeCsv(asJson(row.media)),
    ].join(',');
    csv.push(line);
  }

  fs.writeFileSync(path.resolve(process.cwd(), OUTPUT_CSV), csv.join('\n'));
  console.log(`Wrote ${rows.length} questions to ${OUTPUT_CSV}`);
}

run().catch((error) => {
  console.error('Failed to convert DOCX to CSV:', error);
  process.exit(1);
});
