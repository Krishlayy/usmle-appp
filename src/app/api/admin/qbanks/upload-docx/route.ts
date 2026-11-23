import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseQbankDocx } from '@/lib/qbankDocxParser';

// Video mappings for known modules (Approach to Histology)
const DEFAULT_HISTOLOGY_VIDEOS: Record<number, { title: string; url: string }> = {
  1: { title: 'The Colour Room (Fixation & H&E)', url: '/videos/mnemonics/histology/colour-room.mp4' },
  4: { title: 'Be So Totally Cool, Read Books (Collagen Types)', url: '/videos/mnemonics/histology/read-books.mp4' },
  6: { title: 'The Endocrine Cabinet (Pituitary & Adrenal)', url: '/videos/mnemonics/histology/endocrine-cabinet.mp4' },
  7: { title: 'Seven-Up (Skin & Appendages)', url: '/videos/mnemonics/histology/seven-up.mp4' },
  8: { title: 'Seven-Up (Epidermal Layers)', url: '/videos/mnemonics/histology/seven-up.mp4' },
  9: { title: 'Seven-Up (Dermis & Glands)', url: '/videos/mnemonics/histology/seven-up.mp4' },
  10: { title: 'Seven-Up (Skin Pathology)', url: '/videos/mnemonics/histology/seven-up.mp4' },
  14: { title: 'Be So Totally Cool, Read Books (Type I/II Collagen)', url: '/videos/mnemonics/histology/read-books.mp4' },
  15: { title: 'Be So Totally Cool, Read Books (Type III/IV Collagen)', url: '/videos/mnemonics/histology/read-books.mp4' },
  16: { title: 'The Colour Room (H&E Special Stains)', url: '/videos/mnemonics/histology/colour-room.mp4' },
  17: { title: 'Three Muscles and a Wire (Skeletal Muscle)', url: '/videos/mnemonics/histology/three-muscles.mp4' },
  18: { title: 'Three Muscles and a Wire (Cardiac Muscle)', url: '/videos/mnemonics/histology/three-muscles.mp4' },
  19: { title: 'Three Muscles and a Wire (Smooth Muscle)', url: '/videos/mnemonics/histology/three-muscles.mp4' },
  20: { title: 'Three Muscles and a Wire (Peripheral Nerve)', url: '/videos/mnemonics/histology/three-muscles.mp4' },
  22: { title: 'Down the Gut Tube (Esophagus & Stomach)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  23: { title: 'Down the Gut Tube (Duodenum & Jejunum)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  24: { title: 'Down the Gut Tube (Ileum & Peyer Patches)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  25: { title: 'Down the Gut Tube (Colon & Appendix)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  26: { title: 'Down the Gut Tube (Liver & Gallbladder)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  29: { title: 'The Endocrine Cabinet (Thyroid & Parathyroid)', url: '/videos/mnemonics/histology/endocrine-cabinet.mp4' },
  32: { title: 'The Endocrine Cabinet (Pancreas Islets)', url: '/videos/mnemonics/histology/endocrine-cabinet.mp4' },
  33: { title: 'The Endocrine Cabinet (Adrenal Cortex & Medulla)', url: '/videos/mnemonics/histology/endocrine-cabinet.mp4' },
  34: { title: 'The Endocrine Cabinet (Neuroendocrine Cells)', url: '/videos/mnemonics/histology/endocrine-cabinet.mp4' },
  37: { title: 'Seven-Up (Hair Follicle & Sebaceous)', url: '/videos/mnemonics/histology/seven-up.mp4' },
  38: { title: 'Seven-Up (Melanocytes & Pigment)', url: '/videos/mnemonics/histology/seven-up.mp4' },
  39: { title: 'Down the Gut Tube (GI Mucosal Layers)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  40: { title: 'Be So Totally Cool, Read Books (Basement Membrane)', url: '/videos/mnemonics/histology/read-books.mp4' },
  41: { title: 'Down the Gut Tube (Auerbach & Meissner Plexus)', url: '/videos/mnemonics/histology/down-gut-tube.mp4' },
  43: { title: 'The Endocrine Cabinet (Pineal & Pituitary Axes)', url: '/videos/mnemonics/histology/endocrine-cabinet.mp4' },
  48: { title: 'The Colour Room (Iron & Trichrome Stains)', url: '/videos/mnemonics/histology/colour-room.mp4' },
  49: { title: 'The Colour Room (Silver & PAS Stains)', url: '/videos/mnemonics/histology/colour-room.mp4' },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Approach to Histology';
    const slug = (formData.get('slug') as string) || 'approach-to-histology';
    const specialtyTag = (formData.get('specialtyTag') as string) || 'Pathology & Histology';
    const qbankCode = (formData.get('qbankCode') as string) || 'HIST';
    const priceCents = parseInt((formData.get('price') as string) || '4900', 10);
    const replaceExisting = formData.get('replaceExisting') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json({ error: 'File must be a Microsoft Word (.docx) document' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the DOCX file
    const questions = await parseQbankDocx(buffer, {
      qbankSlug: slug,
      qbankCode,
      // The built-in map is histology-specific; applying it to other banks attaches unrelated videos.
      videoMapping: slug === 'approach-to-histology' ? DEFAULT_HISTOLOGY_VIDEOS : undefined,
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions could be parsed from the document. Please verify the Q<number>. format.' },
        { status: 422 }
      );
    }

    // Upsert the QBank in database safely checking both slug and qbankCode
    const existingBySlug = await prisma.qBank.findUnique({ where: { slug } });
    const existingByCode = await prisma.qBank.findUnique({ where: { qbankCode } });

    let qbank;
    if (existingBySlug) {
      qbank = await prisma.qBank.update({
        where: { id: existingBySlug.id },
        data: {
          title,
          totalQuestions: questions.length,
          specialtyTag,
          lastEditedById: session.user.id,
          lastEditedAt: new Date(),
        },
      });
    } else if (existingByCode) {
      qbank = await prisma.qBank.update({
        where: { id: existingByCode.id },
        data: {
          title,
          slug,
          totalQuestions: questions.length,
          specialtyTag,
          lastEditedById: session.user.id,
          lastEditedAt: new Date(),
        },
      });
    } else {
      qbank = await prisma.qBank.create({
        data: {
          title,
          slug,
          qbankCode,
          price: priceCents,
          currency: 'USD',
          specialtyTag,
          description: `High-yield clinical scenarios and diagnostic microarchitecture with integrated video mnemonics.`,
          totalQuestions: questions.length,
          difficulty: 'Intermediate',
          highYieldScore: 9.4,
          boardCoverage: 'USMLE Step 1 & Step 2 CK',
          isActive: true,
          lastEditedById: session.user.id,
          lastEditedAt: new Date(),
        },
      });
    }

    // If replacing existing questions, delete old questions and related data
    if (replaceExisting) {
      const oldQuestions = await prisma.question.findMany({
        where: { qbankId: qbank.id },
        select: { id: true },
      });
      const oldIds = oldQuestions.map((q) => q.id);

      if (oldIds.length > 0) {
        await prisma.userProgress.deleteMany({ where: { questionId: { in: oldIds } } });
        await prisma.questionMedia.deleteMany({ where: { questionId: { in: oldIds } } });
        await prisma.questionImage.deleteMany({ where: { questionId: { in: oldIds } } });
        await prisma.question.deleteMany({ where: { qbankId: qbank.id } });
      }
    }

    // Insert all parsed questions
    let insertedCount = 0;
    for (const q of questions) {
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

      // Add Vignette Exhibit Media
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

      // Add Explanation Figures
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

      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded and seeded ${insertedCount} questions into "${qbank.title}"`,
      qbank: {
        id: qbank.id,
        title: qbank.title,
        slug: qbank.slug,
        totalQuestions: qbank.totalQuestions,
      },
      parsedCount: insertedCount,
      sampleQuestion: questions[0]
        ? {
            num: questions[0].num,
            title: questions[0].title,
            optionsCount: questions[0].options.length,
            correctAnswer: questions[0].correctAnswer,
            vignetteImagesCount: questions[0].vignetteImages.length,
            explanationImagesCount: questions[0].explanationImages.length,
          }
        : null,
    });
  } catch (error: any) {
    console.error('[API upload-docx ERROR]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse and upload question bank' },
      { status: 500 }
    );
  }
}
