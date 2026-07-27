import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getProtectedTermsRegex } from '@/utils/medicalDictionary';

// MyMemory free translation API — no API key required, 1000 words/day free
// Docs: https://mymemory.translated.net/doc/spec.php
async function translateWithMyMemory(text: string, to: string): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated === 'PLEASE SELECT TWO DISTINCT LANGUAGES') return text;
    return translated;
  } catch (e) {
    console.error('MyMemory translation failed:', e);
    return text; // graceful fallback to original English
  }
}


// A robust regex to find numbers, specific medical units, and math expressions
// We use a Placeholder Replacement Algorithm for safety with the free API
function protectContent(html: string): { protectedHtml: string; placeholders: Record<string, string> } {
  if (!html) return { protectedHtml: '', placeholders: {} };
  
  const placeholders: Record<string, string> = {};
  let counter = 0;
  
  // 1. Protect tables (we replace them entirely so the structure isn't broken)
  let protectedHtml = html.replace(/<table[\s\S]*?<\/table>/gi, match => {
     const ph = `__MED_TABLE_${++counter}__`;
     placeholders[ph] = match;
     return ph;
  });
  
  // 2. Protect numbers and common medical units
  const unitRegex = /\b(\d+(?:\.\d+)?)\s*(mg\/dL|mmHg|mEq\/L|mmol\/L|g\/dL|mL|L|kg|g|mcg|bpm|beats\/min)\b/gi;
  protectedHtml = protectedHtml.replace(unitRegex, match => {
     const ph = `__MED_UNIT_${++counter}__`;
     placeholders[ph] = match;
     return ph;
  });
  
  // 3. Protect Dictionary Terms
  const dictRegex = getProtectedTermsRegex();
  protectedHtml = protectedHtml.replace(dictRegex, match => {
     const ph = `__MED_TERM_${++counter}__`;
     placeholders[ph] = match;
     return ph;
  });

  return { protectedHtml, placeholders };
}

function restoreContent(translatedHtml: string, placeholders: Record<string, string>): string {
  if (!translatedHtml) return '';
  let restored = translatedHtml;
  // Free translation APIs sometimes add spaces around placeholders (e.g. "__ MED_TERM_1 __")
  for (const [ph, original] of Object.entries(placeholders)) {
    const safePh = ph.replace(/_/g, '_\\s*');
    const regex = new RegExp(safePh, 'gi');
    restored = restored.replace(regex, original);
  }
  return restored;
}

// Helper function to safely translate large HTML strings by breaking them into chunks
async function translateLargeText(html: string, to: string): Promise<string> {
  const { protectedHtml, placeholders } = protectContent(html);
  if (!protectedHtml) return '';
  
  // Split by closing block tags to keep chunks small for the free API
  const chunks = protectedHtml.split(/(?<=<\/p>|<\/table>|<\/div>|<br>)/i).filter(c => c.trim().length > 0);
  
  if (chunks.length === 0) return restoreContent(protectedHtml, placeholders);

  const results: string[] = [];
  for (let i = 0; i < chunks.length; i += 3) {
    const batch = chunks.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.map(chunk => chunk.trim() ? translateWithMyMemory(chunk, to) : Promise.resolve(chunk))
    );
    results.push(...batchResults);
  }
  
  return restoreContent(results.join(''), placeholders);
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
      where: { id: questionId },
      include: { media: true }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // 3. Translate content individually using chunking to avoid character limits
    const translatedQuestionText = await translateLargeText(question.questionText, targetLanguage);
    const translatedExplanation = await translateLargeText(question.explanation, targetLanguage);
    
    const options = question.options as any[];
    const translatedOptions = [];
    for (const opt of options) {
      const t = await translateLargeText(opt.text, targetLanguage);
      let translatedOptExp = opt.explanation;
      if (opt.explanation) {
        translatedOptExp = await translateLargeText(opt.explanation, targetLanguage);
      }
      translatedOptions.push({ ...opt, text: t, explanation: translatedOptExp });
    }
    
    // Also translate captions for media if they exist
    const media = question.media as any[];
    const translatedMedia = [];
    if (media && Array.isArray(media)) {
      for (const m of media) {
        if (m.caption) {
          const t = await translateLargeText(m.caption, targetLanguage);
          translatedMedia.push({ ...m, caption: t });
        } else {
          translatedMedia.push(m);
        }
      }
    }

    const translatedData = {
      questionText: translatedQuestionText,
      explanation: translatedExplanation,
      options: translatedOptions,
      media: translatedMedia
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
