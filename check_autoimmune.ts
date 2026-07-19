import { prisma } from './src/lib/db';

async function main() {
  try {
    const qbank = await prisma.qBank.findFirst({
      where: { title: 'Autoimmune Disease (50 Qs)' },
      include: {
        questions: {
          include: { media: true }
        }
      }
    });
    
    if (!qbank) {
      console.log('No autoimmune qbank found.');
      return;
    }
    
    console.log(`Found Qbank: ${qbank.title} (ID: ${qbank.id})`);
    console.log(`Number of questions: ${qbank.questions.length}`);
    
    const questionsWithMedia = qbank.questions.filter(q => q.media.length > 0);
    console.log(`Questions with media objects: ${questionsWithMedia.length}`);
    
    // Let's check for EULAR text in questions
    const eularQuestion = qbank.questions.find(q => 
      (q.questionText && q.questionText.includes('EULAR')) || 
      (q.explanation && q.explanation.includes('EULAR'))
    );
    
    if (eularQuestion) {
      console.log(`\nFound EULAR question (ID: ${eularQuestion.id})`);
      console.log(`Has media object: ${eularQuestion.media.length > 0}`);
      if (eularQuestion.media.length > 0) {
        console.log(`Media URL: ${eularQuestion.media[0].url}`);
      } else {
        console.log(`Checking question text for inline images...`);
        console.log(`Contains <img> tag: ${eularQuestion.questionText?.includes('<img') || eularQuestion.explanation?.includes('<img')}`);
        console.log(`Contains <table tag: ${eularQuestion.questionText?.includes('<table') || eularQuestion.explanation?.includes('<table')}`);
        if (eularQuestion.questionText?.includes('<table')) console.log('Table found in questionText');
        if (eularQuestion.explanation?.includes('<table')) console.log('Table found in explanation');
        if (eularQuestion.questionText?.includes('<img')) console.log('Img found in questionText');
        if (eularQuestion.explanation?.includes('<img')) console.log('Img found in explanation');
      }
    }
  } catch (e: any) {
    console.error('ERROR:', e.message);
  } finally {
    process.exit(0);
  }
}
main();
