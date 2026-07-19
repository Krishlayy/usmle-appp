import { prisma } from './src/lib/db';

async function main() {
  try {
    const q = await prisma.question.findUnique({
      where: { id: 'cmrgypnxp00010orxca5bu5n2' }
    });
    
    if (q) {
      console.log('--- QUESTION TEXT ---');
      const imgMatch = q.questionText.match(/<img[^>]+>/g);
      console.log('Images in questionText:', imgMatch);
      
      console.log('--- EXPLANATION ---');
      const imgMatchExpl = q.explanation.match(/<img[^>]+>/g);
      console.log('Images in explanation:', imgMatchExpl);
      
      const tableMatchExpl = q.explanation.match(/<table[^>]*>/g);
      console.log('Tables in explanation:', tableMatchExpl);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
