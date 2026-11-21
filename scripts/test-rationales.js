const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('scripts/converted_histology.html', 'utf-8');

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

for (let i = 0; i < 5; i++) {
  const current = qHeaders[i];
  const nextStart = (i < qHeaders.length - 1) ? qHeaders[i + 1].start : html.length;
  const qHtml = html.slice(current.start + current.matchLen, nextStart);
  const $ = cheerio.load(qHtml);

  // find 'Why each option is right or wrong'
  let whyElem = null;
  $('h1, h2, h3, h4, p').each((_, elem) => {
    if (/why each option is right or wrong/i.test($(elem).text())) {
      whyElem = $(elem);
    }
  });

  console.log('Q' + current.num + ' Why section found:', !!whyElem);
  if (whyElem) {
    let nextNode = whyElem.next();
    const optRationales = {};
    while (nextNode.length > 0 && !nextNode.is('h1, h2, h3') && !/clinical pearl/i.test(nextNode.text())) {
      const text = nextNode.text().trim();
      const m = text.match(/^([A-E])\.\s*(.*)/s);
      if (m) {
        optRationales[m[1]] = m[2].slice(0, 60) + '...';
      }
      nextNode = nextNode.next();
    }
    console.log('Rationales:', optRationales);
  }
}
