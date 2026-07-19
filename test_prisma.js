const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  try { 
    const question = await prisma.$transaction(async (tx) => { 
      await tx.questionMedia.deleteMany({ where: { questionId: 'cmrqpc4870000vwrxqsyi44mi' } }); 
      return await tx.question.update({ 
        where: { id: 'cmrqpc4870000vwrxqsyi44mi' }, 
        data: { 
          questionText: 'test', 
          options: [{id:'1', text:'test'}], 
          correctAnswer: '1', 
          acceptableAnswers: [], 
          tags: [], 
          explanation: 'test', 
          difficulty: 'medium', 
          subtopic: null 
        } 
      }); 
    }); 
    console.log(question); 
  } catch (e) { 
    console.error('ERROR:', e.message); 
  } finally { 
    await prisma.$disconnect(); 
  } 
} 
main();
