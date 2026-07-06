const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const id = "cmr3wfxdn0001jgrxeqrppluo";
    const res = await prisma.$transaction(async (tx) => {
      await tx.questionMedia.deleteMany({
        where: { questionId: id }
      });

      return await tx.question.update({
        where: { id },
        data: {
          media: {
            create: [
              {
                type: 'IMAGE',
                url: 'https://example.com/image.png',
                caption: '',
                placement: 'TOP',
                displaySize: 'MEDIUM',
                order: 0,
              }
            ]
          }
        }
      });
    });
    console.log("SUCCESS:", res.id);
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
