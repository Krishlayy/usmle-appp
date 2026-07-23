import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Create Cardiology QBank
  const cardiologyQbank = await prisma.qBank.upsert({
    where: { slug: 'cardiology' },
    
    update: {},
    create: {
      title: 'Cardiology QBank',
      slug: 'cardiology',
      qbankCode: 'CARD',
      description: 'Master the cardiovascular system with this high-yield question bank for USMLE Step 1 and 2 CK.',
      specialtyTag: 'Cardiology',
      price: 2900, // $29.00
      currency: 'USD',
      totalQuestions: 15,
      isActive: true,
      questions: {
        create: [
          {
            qid: 'CARD-1',
            questionText: 'A 65-year-old man presents to the emergency department with tearing chest pain radiating to his back. His blood pressure is 180/100 mmHg in the right arm and 120/70 mmHg in the left arm. What is the most likely diagnosis?',
            options: JSON.stringify([
              { id: 'A', text: 'Myocardial infarction' },
              { id: 'B', text: 'Aortic dissection' },
              { id: 'C', text: 'Pulmonary embolism' },
              { id: 'D', text: 'Pericarditis' },
            ]),
            correctAnswer: 'B',
            explanation: 'The patient\'s symptoms (tearing chest pain radiating to the back) and physical findings (unequal blood pressures in the arms) are classic for aortic dissection. The unequal blood pressure is due to the dissection flap occluding the brachiocephalic or left subclavian artery.',
            difficulty: 'medium',
            subtopic: 'Aortic Diseases',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
          },
          {
            qid: 'CARD-2',
            questionText: 'A 45-year-old woman is evaluated for a heart murmur. Physical examination reveals a loud first heart sound (S1), an opening snap, and a mid-diastolic rumble at the apex. Which of the following is the most likely cause of her murmur?',
            options: JSON.stringify([
              { id: 'A', text: 'Aortic stenosis' },
              { id: 'B', text: 'Aortic regurgitation' },
              { id: 'C', text: 'Mitral stenosis' },
              { id: 'D', text: 'Mitral regurgitation' },
            ]),
            correctAnswer: 'C',
            explanation: 'A loud S1, opening snap, and mid-diastolic rumble at the apex are characteristic findings of mitral stenosis, commonly caused by rheumatic heart disease.',
            difficulty: 'easy',
            subtopic: 'Valvular Heart Disease',
          },
          // Generating 13 more simple variations to reach 15 questions
          ...Array.from({ length: 13 }).map((_, i) => ({
            qid: `CARD-${i + 3}`,
            questionText: `Cardiology Practice Question ${i + 3}: A patient presents with typical cardiac symptoms...`,
            options: JSON.stringify([
              { id: 'A', text: 'Option A' },
              { id: 'B', text: 'Option B' },
              { id: 'C', text: 'Option C' },
              { id: 'D', text: 'Option D' },
            ]),
            correctAnswer: 'A',
            explanation: 'Detailed explanation for this cardiac finding goes here.',
            difficulty: i % 2 === 0 ? 'medium' : 'hard',
            subtopic: i % 3 === 0 ? 'Arrhythmias' : 'Heart Failure',
          }))
        ],
      },
    },
  });

  // 2. Create Neurology QBank
  const neurologyQbank = await prisma.qBank.upsert({
    where: { slug: 'neurology' },
    update: {},
    create: {
      title: 'Neurology QBank',
      slug: 'neurology',
      qbankCode: 'NEURO',
      description: 'Comprehensive review of the nervous system for the USMLE exams.',
      specialtyTag: 'Neurology',
      price: 2500, // $25.00
      currency: 'USD',
      totalQuestions: 15,
      isActive: true,
      questions: {
        create: [
          {
            qid: 'NEURO-1',
            questionText: 'A 28-year-old woman presents with sudden onset of unilateral vision loss and pain with eye movement. She had a similar episode of vision loss in the other eye 2 years ago, which resolved completely. MRI of the brain shows multiple periventricular white matter lesions. What is the most likely diagnosis?',
            options: JSON.stringify([
              { id: 'A', text: 'Guillain-Barré syndrome' },
              { id: 'B', text: 'Myasthenia gravis' },
              { id: 'C', text: 'Multiple sclerosis' },
              { id: 'D', text: 'Neuromyelitis optica' },
            ]),
            correctAnswer: 'C',
            explanation: 'This presentation is highly suggestive of optic neuritis, a common initial manifestation of multiple sclerosis (MS). The history of a similar episode separated by time, along with periventricular white matter lesions on MRI (separated by space), fulfills the McDonald criteria for MS.',
            difficulty: 'medium',
            subtopic: 'Demyelinating Diseases',
            imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
          },
          ...Array.from({ length: 14 }).map((_, i) => ({
            qid: `NEURO-${i + 2}`,
            questionText: `Neurology Practice Question ${i + 2}: A patient presents with neurological deficits...`,
            options: JSON.stringify([
              { id: 'A', text: 'Option A' },
              { id: 'B', text: 'Option B' },
              { id: 'C', text: 'Option C' },
              { id: 'D', text: 'Option D' },
            ]),
            correctAnswer: 'B',
            explanation: 'Detailed explanation for this neurological finding goes here.',
            difficulty: i % 2 === 0 ? 'easy' : 'hard',
            subtopic: i % 3 === 0 ? 'Stroke' : 'Movement Disorders',
          }))
        ],
      },
    },
  });

  console.log('Database seeded successfully.');
  console.log(`Created QBank: ${cardiologyQbank.title} (${cardiologyQbank.totalQuestions} questions)`);
  console.log(`Created QBank: ${neurologyQbank.title} (${neurologyQbank.totalQuestions} questions)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
