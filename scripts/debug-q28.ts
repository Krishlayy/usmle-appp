import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.join(__dirname, 'converted_histology.html'), 'utf-8');

const qRegex = /<h1[^>]*>.*?Q(\d+)\.\s*([^<]+).*?<\/h1>/gi;
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

for (let i = 25; i < 31; i++) {
  console.log(`Index ${i}: Q${qHeaders[i].num} - "${qHeaders[i].title}" (start: ${qHeaders[i].start})`);
}
