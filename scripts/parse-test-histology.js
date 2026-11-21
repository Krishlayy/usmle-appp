const mammoth = require('mammoth');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const docxPath = 'C:\\Projects\\MQB\\Approach to Histology\\2026-10-09_Approach_to_Histology_Qbank_Q1-50_Poojan_Draft_V5 (2).docx';
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'qbank', 'histology');

fs.mkdirSync(uploadDir, { recursive: true });

let imgCount = 0;
const options = {
  convertImage: mammoth.images.imgElement((image) => {
    imgCount++;
    const ext = image.contentType.includes('png') ? 'png' : 'jpg';
    const filename = `hist_${imgCount}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    const webUrl = `/uploads/qbank/histology/${filename}`;
    return image.read().then((buffer) => {
      fs.writeFileSync(filePath, buffer);
      return { src: webUrl };
    });
  })
};

async function testParse() {
  console.log('Converting docx with image extraction...');
  const result = await mammoth.convertToHtml({ path: docxPath }, options);
  console.log(`Converted HTML length: ${result.value.length}, extracted ${imgCount} images.`);

  const html = result.value;
  fs.writeFileSync(path.join(__dirname, 'converted_histology.html'), html);
  console.log('Saved converted_histology.html');
}

testParse().catch(console.error);
