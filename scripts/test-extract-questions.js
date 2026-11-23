const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'converted_histology.html'), 'utf-8');

// The video mapping from the user's brief:
const videoMapping = {
  1: { url: '/videos/histology/video_1_the_colour_room.mp4', title: 'The Colour Room' },
  16: { url: '/videos/histology/video_1_the_colour_room.mp4', title: 'The Colour Room' },
  48: { url: '/videos/histology/video_1_the_colour_room.mp4', title: 'The Colour Room' },
  49: { url: '/videos/histology/video_1_the_colour_room.mp4', title: 'The Colour Room' },

  4: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4', title: 'Be So Totally Cool, Read Books' },
  14: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4', title: 'Be So Totally Cool, Read Books' },
  15: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4', title: 'Be So Totally Cool, Read Books' },
  40: { url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4', title: 'Be So Totally Cool, Read Books' },

  17: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4', title: 'Three Muscles and a Wire' },
  18: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4', title: 'Three Muscles and a Wire' },
  19: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4', title: 'Three Muscles and a Wire' },
  20: { url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4', title: 'Three Muscles and a Wire' },

  22: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },
  23: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },
  24: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },
  25: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },
  26: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },
  39: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },
  41: { url: '/videos/histology/video_4_down_the_gut_tube.mp4', title: 'Down the Gut Tube' },

  6: { url: '/videos/histology/video_5_the_endocrine_cabinet.mp4', title: 'The Endocrine Cabinet' },
  29: { url: '/videos/histology/video_5_the_endocrine_cabinet.mp4', title: 'The Endocrine Cabinet' },
  32: { url: '/videos/histology/video_5_the_endocrine_cabinet.mp4', title: 'The Endocrine Cabinet' },
  33: { url: '/videos/histology/video_5_the_endocrine_cabinet.mp4', title: 'The Endocrine Cabinet' },
  34: { url: '/videos/histology/video_5_the_endocrine_cabinet.mp4', title: 'The Endocrine Cabinet' },
  43: { url: '/videos/histology/video_5_the_endocrine_cabinet.mp4', title: 'The Endocrine Cabinet' },

  7: { url: '/videos/histology/video_6_seven_up.mp4', title: 'SEVEN UP' },
  8: { url: '/videos/histology/video_6_seven_up.mp4', title: 'SEVEN UP' },
  9: { url: '/videos/histology/video_6_seven_up.mp4', title: 'SEVEN UP' },
  10: { url: '/videos/histology/video_6_seven_up.mp4', title: 'SEVEN UP' },
  37: { url: '/videos/histology/video_6_seven_up.mp4', title: 'SEVEN UP' },
  38: { url: '/videos/histology/video_6_seven_up.mp4', title: 'SEVEN UP' }
};

// We will find all question split points
// Headings match: <h1>...Q<num>...</h1> or similar
const qRegex = /<h1[^>]*>.*?Q(\d+)\.\s*([^<]+).*?<\/h1>/gi;
let match;
const qHeaders = [];

while ((match = qRegex.exec(html)) !== null) {
  qHeaders.push({
    num: parseInt(match[1]),
    title: match[2].trim(),
    start: match.index,
    matchLen: match[0].length
  });
}

console.log(`Found ${qHeaders.length} question headers.`);

const parsedQuestions = [];

for (let i = 0; i < qHeaders.length; i++) {
  const current = qHeaders[i];
  const nextStart = (i < qHeaders.length - 1) ? qHeaders[i + 1].start : html.length;
  const qHtml = html.slice(current.start + current.matchLen, nextStart);

  const $ = cheerio.load(qHtml);

  // Let's find Answer choices
  // Can be <h3><strong>Answer choices</strong></h3> or <p><strong>Answer choices</strong></p>
  let answerChoicesElem = null;
  $('h1, h2, h3, h4, p').each((_, elem) => {
    const text = $(elem).text().trim();
    if (/^answer\s*choices$/i.test(text)) {
      if (!answerChoicesElem) answerChoicesElem = $(elem);
    }
  });

  if (!answerChoicesElem) {
    console.error(`Question Q${current.num} missing 'Answer choices'!`);
    continue;
  }

  // Everything before Answer choices is Clinical Vignette
  // Let's extract all elements before answerChoicesElem
  const vignetteNodes = [];
  let curr = answerChoicesElem.prev();
  while (curr.length > 0) {
    vignetteNodes.unshift(curr);
    curr = curr.prev();
  }

  const $vignette = cheerio.load('<div></div>');
  vignetteNodes.forEach(node => {
    // Remove if it's the "Clinical vignette" heading itself
    if (node.is('h3') && /clinical\s*vignette/i.test(node.text())) {
      return;
    }
    $vignette('div').append(node.clone());
  });

  // Extract vignette images
  const vignetteImages = [];
  $vignette('img').each((_, img) => {
    const src = $vignette(img).attr('src');
    if (src) vignetteImages.push(src);
  });

  // Now find the options table
  // The table right after Answer choices
  const optionsTable = answerChoicesElem.nextAll('table').first();
  const options = [];
  if (optionsTable.length > 0) {
    optionsTable.find('tr').each((_, tr) => {
      const cells = $(tr).find('th, td');
      if (cells.length >= 2) {
        const id = $(cells[0]).text().trim().replace(/[^\w]/g, '');
        const text = $(cells[1]).html()?.trim() || $(cells[1]).text().trim();
        // Clean inner <p> if wrapped
        const cleanText = text.replace(/^<p>/i, '').replace(/<\/p>$/i, '').trim();
        if (id && cleanText) {
          options.push({ id, text: cleanText });
        }
      }
    });
  }

  // Answer
  // Look for "Answer: X"
  let correctAnswer = '';
  const textAfterTable = qHtml;
  const ansMatch = textAfterTable.match(/<strong>Answer:\s*([A-F])<\/strong>/i) || 
                   textAfterTable.match(/Answer:\s*([A-F])/i);
  if (ansMatch) {
    correctAnswer = ansMatch[1].toUpperCase();
  }

  // Concept explanation and onwards
  let explanationElem = null;
  $('h3').each((_, elem) => {
    const text = $(elem).text().trim();
    if (/concept\s*explanation/i.test(text) || /explanation/i.test(text)) {
      if (!explanationElem && answerChoicesElem && $(elem).index() > answerChoicesElem.index()) {
        explanationElem = $(elem);
      }
    }
  });

  let explanationHtml = '';
  if (explanationElem) {
    const explNodes = [];
    let nextNode = explanationElem.next();
    while (nextNode.length > 0) {
      explNodes.push(nextNode);
      nextNode = nextNode.next();
    }

    const $expl = cheerio.load('<div></div>');
    explNodes.forEach(node => {
      // Style tables nicely
      if (node.is('table')) {
        node.addClass('qbank-table border-collapse w-full my-4 border border-slate-300 text-sm');
        node.find('th, td').addClass('border border-slate-300 p-2 text-left');
        node.find('thead th').addClass('bg-slate-100 font-semibold text-slate-800');
      }
      // Style images nicely
      node.find('img').each((_, img) => {
        $expl(img).addClass('max-w-full h-auto rounded border border-slate-200 my-3 shadow-xs');
      });
      if (node.is('img')) {
        node.addClass('max-w-full h-auto rounded border border-slate-200 my-3 shadow-xs');
      }
      $expl('div').append(node.clone());
    });

    explanationHtml = $expl('div').html() || '';
  }

  // Collect explanation images
  const explanationImages = [];
  if (explanationHtml) {
    const $explTemp = cheerio.load(explanationHtml);
    $explTemp('img').each((_, img) => {
      const src = $explTemp(img).attr('src');
      if (src && !vignetteImages.includes(src)) {
        explanationImages.push(src);
      }
    });
  }

  const vignetteHtml = $vignette('div').html() || '';

  parsedQuestions.push({
    num: current.num,
    title: current.title,
    vignetteHtml,
    vignetteImages,
    options,
    correctAnswer,
    explanationHtml,
    explanationImages,
    video: videoMapping[current.num] || null
  });
}

console.log(`Parsed ${parsedQuestions.length} complete questions.`);
for (const q of parsedQuestions) {
  console.log(`Q${q.num}: "${q.title}" | Options: ${q.options.length} | Ans: ${q.correctAnswer} | VignetteImgs: ${q.vignetteImages.length} | ExplImgs: ${q.explanationImages.length} | Video: ${q.video ? q.video.title : 'None'}`);
}
