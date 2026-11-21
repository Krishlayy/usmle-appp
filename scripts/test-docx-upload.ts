import fs from 'fs';
import path from 'path';
import { parseQbankDocx } from '../src/lib/qbankDocxParser';

async function main() {
  const docxPath = 'C:\\Projects\\MQB\\Approach to Histology\\2026-10-09_Approach_to_Histology_Qbank_Q1-50_Poojan_Draft_V5 (2).docx';
  console.log('Reading DOCX file:', docxPath);

  const buffer = fs.readFileSync(docxPath);
  console.log(`Buffer size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  const questions = await parseQbankDocx(buffer, {
    qbankSlug: 'approach-to-histology',
    qbankCode: 'HIST',
  });

  console.log(`\nSuccessfully parsed: ${questions.length} questions!`);
  
  if (questions.length > 0) {
    const q1 = questions[0];
    console.log('\n--- Question 1 Sample ---');
    console.log('Title:', q1.title);
    console.log('Options count:', q1.options.length);
    console.log('Options:', q1.options.map(o => `${o.id}: ${o.text.slice(0, 30)}...`));
    console.log('Correct Answer:', q1.correctAnswer);
    console.log('Vignette images:', q1.vignetteImages);
    console.log('Explanation images count:', q1.explanationImages.length);
    console.log('Question text preview:', q1.questionText.slice(0, 200));

    const q28 = questions.find(q => q.num === 28);
    if (q28) {
      console.log('\n--- Question 28 Check ---');
      console.log('Title:', q28.title);
      console.log('Options count:', q28.options.length);
      console.log('Correct Answer:', q28.correctAnswer);
      console.log('Explanation images count:', q28.explanationImages.length);
    }

    const q50 = questions.find(q => q.num === 50);
    if (q50) {
      console.log('\n--- Question 50 Check ---');
      console.log('Title:', q50.title);
      console.log('Options count:', q50.options.length);
      console.log('Correct Answer:', q50.correctAnswer);
    }
  }
}

main().catch(console.error);
