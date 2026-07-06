const mammoth = require("mammoth");
const fs = require("fs");

async function run() {
  try {
    const result = await mammoth.extractRawText({ path: "2026-06-11_Autoimmune_Disease_Qbank_Q1-50_Poojan_V3 (1).docx" });
    const text = result.value;
    fs.writeFileSync("qbank_raw.txt", text);
    console.log("Extracted text successfully!");
    
    // Print first 50 lines to console
    const lines = text.split('\n').slice(0, 50);
    console.log(lines.join('\n'));
  } catch (err) {
    console.error("Error reading docx:", err);
  }
}

run();
