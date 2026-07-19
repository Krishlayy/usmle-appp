import { prisma } from './src/lib/db';

async function main() {
  try {
    const q = await prisma.question.findUnique({
      where: { id: 'cmrgypnxp00010orxca5bu5n2' }
    });
    
    if (q) {
      console.log('Options:', JSON.stringify(q.options, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
