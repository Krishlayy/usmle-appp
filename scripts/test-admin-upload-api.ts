import fs from 'fs';
import 'dotenv/config';
import { prisma } from '../src/lib/db';
import { parseQbankDocx } from '../src/lib/qbankDocxParser';

async function main() {
  console.log('Testing full Admin QBank Upload Engine...');
  const docxPath = 'C:\\Projects\\MQB\\Approach to Histology\\2026-10-09_Approach_to_Histology_Qbank_Q1-50_Poojan_Draft_V5 (2).docx';
  const buffer = fs.readFileSync(docxPath);

  const DEFAULT_HISTOLOGY_VIDEOS: Record<number, { title: string; url: string }> = {
    1: { title: 'The Colour Room (Fixation & H&E)', url: '/videos/histology/video_1_the_colour_room.mp4' },
    4: { title: 'Be So Totally Cool, Read Books (Collagen Types)', url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4' },
    6: { title: 'The Endocrine Cabinet (Pituitary & Adrenal)', url: '/videos/histology/video_5_the_endocrine_cabinet.mp4' },
    7: { title: 'Seven-Up (Skin & Appendages)', url: '/videos/histology/video_6_seven_up.mp4' },
    8: { title: 'Seven-Up (Epidermal Layers)', url: '/videos/histology/video_6_seven_up.mp4' },
    9: { title: 'Seven-Up (Dermis & Glands)', url: '/videos/histology/video_6_seven_up.mp4' },
    10: { title: 'Seven-Up (Skin Pathology)', url: '/videos/histology/video_6_seven_up.mp4' },
    14: { title: 'Be So Totally Cool, Read Books (Type I/II Collagen)', url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4' },
    15: { title: 'Be So Totally Cool, Read Books (Type III/IV Collagen)', url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4' },
    16: { title: 'The Colour Room (H&E Special Stains)', url: '/videos/histology/video_1_the_colour_room.mp4' },
    17: { title: 'Three Muscles and a Wire (Skeletal Muscle)', url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4' },
    18: { title: 'Three Muscles and a Wire (Cardiac Muscle)', url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4' },
    19: { title: 'Three Muscles and a Wire (Smooth Muscle)', url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4' },
    20: { title: 'Three Muscles and a Wire (Peripheral Nerve)', url: '/videos/histology/video_3_three_muscles_and_a_wire.mp4' },
    22: { title: 'Down the Gut Tube (Esophagus & Stomach)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    23: { title: 'Down the Gut Tube (Duodenum & Jejunum)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    24: { title: 'Down the Gut Tube (Ileum & Peyer Patches)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    25: { title: 'Down the Gut Tube (Colon & Appendix)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    26: { title: 'Down the Gut Tube (Liver & Gallbladder)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    29: { title: 'The Endocrine Cabinet (Thyroid & Parathyroid)', url: '/videos/histology/video_5_the_endocrine_cabinet.mp4' },
    32: { title: 'The Endocrine Cabinet (Pancreas Islets)', url: '/videos/histology/video_5_the_endocrine_cabinet.mp4' },
    33: { title: 'The Endocrine Cabinet (Adrenal Cortex & Medulla)', url: '/videos/histology/video_5_the_endocrine_cabinet.mp4' },
    34: { title: 'The Endocrine Cabinet (Neuroendocrine Cells)', url: '/videos/histology/video_5_the_endocrine_cabinet.mp4' },
    37: { title: 'Seven-Up (Hair Follicle & Sebaceous)', url: '/videos/histology/video_6_seven_up.mp4' },
    38: { title: 'Seven-Up (Melanocytes & Pigment)', url: '/videos/histology/video_6_seven_up.mp4' },
    39: { title: 'Down the Gut Tube (GI Mucosal Layers)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    40: { title: 'Be So Totally Cool, Read Books (Basement Membrane)', url: '/videos/histology/video_2_be_so_totally_cool_read_books.mp4' },
    41: { title: 'Down the Gut Tube (Auerbach & Meissner Plexus)', url: '/videos/histology/video_4_down_the_gut_tube.mp4' },
    43: { title: 'The Endocrine Cabinet (Pineal & Pituitary Axes)', url: '/videos/histology/video_5_the_endocrine_cabinet.mp4' },
    48: { title: 'The Colour Room (Iron & Trichrome Stains)', url: '/videos/histology/video_1_the_colour_room.mp4' },
    49: { title: 'The Colour Room (Silver & PAS Stains)', url: '/videos/histology/video_1_the_colour_room.mp4' },
  };

  const parsedQuestions = await parseQbankDocx(buffer, {
    qbankSlug: 'approach-to-histology',
    qbankCode: 'HIST',
    videoMapping: DEFAULT_HISTOLOGY_VIDEOS,
  });

  console.log(`Parsed ${parsedQuestions.length} questions.`);

  const qbank = await prisma.qBank.upsert({
    where: { slug: 'approach-to-histology' },
    create: {
      title: 'Approach to Histology',
      slug: 'approach-to-histology',
      qbankCode: 'HIST',
      price: 4900,
      currency: 'USD',
      specialtyTag: 'Pathology & Histology',
      description: 'High-yield clinical scenarios and diagnostic microarchitecture with integrated video mnemonics.',
      totalQuestions: parsedQuestions.length,
      difficulty: 'Intermediate',
      highYieldScore: 9.4,
      boardCoverage: 'USMLE Step 1 & Step 2 CK',
      isActive: true,
      lastEditedAt: new Date(),
    },
    update: {
      totalQuestions: parsedQuestions.length,
      lastEditedAt: new Date(),
    },
  });

  // Clear existing questions for clean upload
  const oldQuestions = await prisma.question.findMany({
    where: { qbankId: qbank.id },
    select: { id: true },
  });
  const oldIds = oldQuestions.map(q => q.id);

  if (oldIds.length > 0) {
    console.log(`Clearing ${oldIds.length} existing questions and relations...`);
    await prisma.userProgress.deleteMany({ where: { questionId: { in: oldIds } } });
    await prisma.questionMedia.deleteMany({ where: { questionId: { in: oldIds } } });
    await prisma.questionImage.deleteMany({ where: { questionId: { in: oldIds } } });
    await prisma.question.deleteMany({ where: { qbankId: qbank.id } });
  }

  console.log('Inserting parsed questions into database with clean simple text...');
  let count = 0;
  for (const q of parsedQuestions) {
    const createdQuestion = await prisma.question.create({
      data: {
        qbankId: qbank.id,
        qid: q.qid,
        questionText: q.questionText,
        explanation: q.explanation,
        correctAnswer: q.correctAnswer,
        acceptableAnswers: [],
        videoUrl: q.videoUrl,
        options: q.options,
        status: 'PUBLISHED',
        difficulty: 'medium',
        subtopic: q.title,
        tags: ['Histology', 'Pathology', 'USMLE Step 1'],
      },
    });

    if (q.vignetteImages.length > 0) {
      await prisma.questionMedia.createMany({
        data: q.vignetteImages.map((url, idx) => ({
          questionId: createdQuestion.id,
          url,
          type: 'IMAGE',
          caption: `Clinical Exhibit ${idx + 1}`,
          order: idx + 1,
        })),
      });
    }

    if (q.explanationImages.length > 0) {
      await prisma.questionImage.createMany({
        data: q.explanationImages.map((url, idx) => ({
          questionId: createdQuestion.id,
          url,
          caption: `Figure ${q.num}.${idx + 1}`,
          order: idx + 1,
        })),
      });
    }

    count++;
  }

  console.log(`Successfully ingested all ${count} questions into database!`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
