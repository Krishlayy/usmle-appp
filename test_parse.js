const fs = require('fs');

const raw = fs.readFileSync('qbank_raw.txt', 'utf8');

// Regex to match "Q1. ", "Q2. ", etc.
const questionBlocks = raw.split(/\n(?=Q\d+\.\s*)/).filter(q => q.trim().startsWith('Q'));

console.log(`Found ${questionBlocks.length} questions.`);

for (let i = 0; i < 2; i++) {
  const block = questionBlocks[i];
  
  const titleMatch = block.match(/^Q\d+\.\s*(.+)/);
  const subtopic = titleMatch ? titleMatch[1].trim() : 'Unknown';
  
  const vignetteStart = block.indexOf('Clinical vignette');
  const answerChoicesStart = block.indexOf('Answer choices');
  
  const vignette = block.slice(vignetteStart + 'Clinical vignette'.length, answerChoicesStart).trim();
  
  const answerStart = block.indexOf('Answer:');
  const choicesStr = block.slice(answerChoicesStart + 'Answer choices'.length, answerStart).trim();
  
  // Extract correct answer letter
  const answerMatch = block.match(/Answer:\s*([A-E])/);
  const correctLetter = answerMatch ? answerMatch[1] : null;
  
  const explanationStart = block.indexOf('Concept explanation');
  let explanation = '';
  if (explanationStart !== -1) {
    explanation = block.slice(explanationStart + 'Concept explanation'.length).trim();
  }
  
  // Parse choices
  const optionLines = choicesStr.split('\n').map(l => l.trim()).filter(l => l);
  const options = [];
  let currentOpt = null;
  
  for (let j = 0; j < optionLines.length; j++) {
    const line = optionLines[j];
    if (/^[A-E]$/.test(line)) {
      currentOpt = { letter: line, text: '' };
      options.push(currentOpt);
    } else if (line === '⊘' || line === '✓' || line === '~') {
      // End of option indicator
      if (line === '✓') {
        currentOpt.isCorrect = true;
      }
    } else {
      if (currentOpt) {
        currentOpt.text += (currentOpt.text ? '\n' : '') + line;
      }
    }
  }

  // Format for DB
  const dbOptions = options.map(o => ({
    id: o.letter,
    text: o.text,
    isCorrect: o.letter === correctLetter,
  }));

  console.log(`\n--- Question ${i+1} ---`);
  console.log("Subtopic:", subtopic);
  console.log("Vignette:", vignette.substring(0, 50) + "...");
  console.log("Options:", JSON.stringify(dbOptions, null, 2));
  console.log("Explanation length:", explanation.length);
}
