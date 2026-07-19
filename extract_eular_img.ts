import { prisma } from './src/lib/db';
import * as fs from 'fs';

async function main() {
  try {
    const q = await prisma.question.findUnique({
      where: { id: 'cmrgypnxp00010orxca5bu5n2' }
    });
    
    if (q) {
      const imgMatchExpl = q.explanation.match(/<img[^>]+src="([^"]+)"[^>]*>/);
      if (imgMatchExpl && imgMatchExpl[1]) {
        const src = imgMatchExpl[1];
        if (src.startsWith('data:image/jpeg;base64,')) {
          const base64 = src.replace('data:image/jpeg;base64,', '');
          fs.writeFileSync('eular_extracted.jpg', Buffer.from(base64, 'base64'));
          console.log('Saved eular_extracted.jpg');
        } else {
          console.log('Not a base64 jpeg:', src.substring(0, 50));
        }
      } else {
        console.log('No img src found');
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
