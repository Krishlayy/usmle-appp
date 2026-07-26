import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

// A robust regex to find numbers, specific medical units, and math expressions
// We wrap these in <span translate="no"> to prevent Google Translate from messing them up.
function protectContent(html: string): string {
  if (!html) return '';
  
  // 1. Protect tables
  let protectedHtml = html.replace(/<table[\s\S]*?<\/table>/gi, match => `<span translate="no">${match}</span>`);
  
  // 2. Protect numbers and common medical units (e.g., 150 mg/dL, 50 mmHg, etc)
  const unitRegex = /\b(\d+(?:\.\d+)?)\s*(mg\/dL|mmHg|mEq\/L|mmol\/L|g\/dL|mL|L|kg|g|mcg|bpm|beats\/min)\b/gi;
  protectedHtml = protectedHtml.replace(unitRegex, match => `<span translate="no">${match}</span>`);
  
  // 3. Protect specific keywords, drug names (we'll just do a few common abbreviations for now)
  const medicalAbbreviations = /\b(ECG|MRI|CT|HbA1c|CBC|BMP|LFTs|TSH|HIV|DNA|RNA|ATP)\b/g;
  protectedHtml = protectedHtml.replace(medicalAbbreviations, match => `<span translate="no">${match}</span>`);

  return protectedHtml;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, targetLanguage } = await req.json();

    if (!questionId || !targetLanguage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check Cache
    const cachedTranslation = await prisma.translationCache.findUnique({
      where: {
        questionId_languageCode: {
          questionId,
          languageCode: targetLanguage
        }
      }
    });

    if (cachedTranslation) {
      return NextResponse.json({ translatedData: cachedTranslation.translatedData });
    }

    // 2. Fetch Original Question
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // 3. Prepare content for translation
    const textsToTranslate = [
      protectContent(question.questionText),
      protectContent(question.explanation),
    ];

    const options = question.options as any[];
    options.forEach(opt => {
      textsToTranslate.push(protectContent(opt.text));
    });

    // 4. Send to Google Translate API
    const [translations] = await translate.translate(textsToTranslate, {
      to: targetLanguage,
      format: 'html' // Crucial: maintains HTML structure
    });

    const translatedQuestionText = translations[0];
    const translatedExplanation = translations[1];
    const translatedOptions = options.map((opt, index) => ({
      ...opt,
      text: translations[index + 2]
    }));

    const translatedData = {
      questionText: translatedQuestionText,
      explanation: translatedExplanation,
      options: translatedOptions
    };

    // 5. Save to Cache
    await prisma.translationCache.create({
      data: {
        questionId,
        languageCode: targetLanguage,
        translatedData
      }
    });

    return NextResponse.json({ translatedData });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}
