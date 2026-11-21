import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const html = fs.readFileSync(path.join(__dirname, 'converted_histology.html'), 'utf-8');

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

console.log('Total questions matched:', qHeaders.length);
const q28 = qHeaders[27];
const nextStart = qHeaders[28].start;
const qHtml = html.slice(q28.start + q28.matchLen, nextStart);

const $ = cheerio.load(qHtml);
console.log('Q28 vignette length:', qHtml.length);
console.log('Contains Why each option:', qHtml.includes('Why each option is right or wrong'));
console.log('Contains Clinical pearl:', qHtml.includes('Clinical pearl'));
