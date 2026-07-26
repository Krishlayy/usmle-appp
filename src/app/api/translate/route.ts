import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import translate from 'google-translate-api-x';

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

    // 4. Send to google-translate-api-x (free web API)
    // google-translate-api-x supports arrays for batch translation
    const res = await translate(textsToTranslate, {
      to: targetLanguage,
      rejectOnPartialFail: false,
      forceBatch: false,
      // The free web API doesn't have an explicit format='html' flag like the cloud API,
      // but it attempts to preserve HTML inherently. The 'no' tags we added above will still protect terms.
    });

    const translatedQuestionText = res[0]?.text || textsToTranslate[0];
    const translatedExplanation = res[1]?.text || textsToTranslate[1];
    const translatedOptions = options.map((opt, index) => ({
      ...opt,
      text: res[index + 2]?.text || textsToTranslate[index + 2]
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
