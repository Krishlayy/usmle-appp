import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function translateWithGemini(htmlContent: string, to: string): Promise<string> {
  if (!htmlContent || !htmlContent.trim()) return htmlContent;
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    throw new Error('Server configuration error: Gemini API key missing.');
  }

  const prompt = `You are an expert medical translator. Translate the following medical vignette, question, options, and explanation from English to ${to}.
  
CRITICAL RULES:
1. Preserve ALL HTML tags perfectly. Do not alter the structure of the HTML.
2. Preserve all medical terminology, drug names, and lab values. Only translate the conversational and descriptive text.
3. Ensure the translation flows naturally for a medical student taking a professional exam.

Here is the HTML content to translate:
\`\`\`html
${htmlContent}
\`\`\`

Return ONLY the translated HTML content, without any markdown formatting blocks or surrounding text. Do NOT wrap it in \`\`\`html.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    let result = response.text || '';
    
    // Clean up potential markdown formatting that Gemini might output despite instructions
    result = result.replace(/^```html\n?/i, '').replace(/\n?```$/i, '').trim();
    
    return result;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to translate content via Gemini API');
  }
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
    
    if (targetLanguage === 'en') {
      return NextResponse.json({ translatedData: null });
    }

    // 1. Check Cache First
    const cached = await prisma.translationCache.findUnique({
      where: {
        questionId_languageCode: {
          questionId,
          languageCode: targetLanguage,
        },
      },
    });

    if (cached) {
      return NextResponse.json({ translatedData: cached.translatedData });
    }

    // 2. Fetch original question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // 3. Assemble JSON Payload for Translation
    // We package the entire question data into a single JSON object to maintain context,
    // then translate it all at once using Gemini.
    
    const options = question.options as any[] || [];
    
    const payloadToTranslate = {
      questionText: question.questionText,
      explanation: question.explanation || '',
      options: options.map(opt => ({
        id: opt.id,
        text: opt.text,
      })),
    };

    // Serialize to HTML-like structure or just stringify it for Gemini.
    // For maximum structural preservation, we'll format it into an HTML-like block so Gemini respects the boundaries.
    
    let assembledHtml = `
<div id="q-text">${payloadToTranslate.questionText}</div>
<div id="q-exp">${payloadToTranslate.explanation}</div>
`;
    payloadToTranslate.options.forEach((opt, index) => {
      assembledHtml += `<div id="opt-${index}">${opt.text}</div>\n`;
    });

    const translatedHtml = await translateWithGemini(assembledHtml, targetLanguage);

    // Parse the translated HTML back into our JSON structure
    // Since we used simple div IDs, we can extract them using regex safely.
    
    const extractContent = (html: string, id: string) => {
      const match = html.match(new RegExp(`<div[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/div>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const translatedQuestionText = extractContent(translatedHtml, 'q-text') || payloadToTranslate.questionText;
    const translatedExplanation = extractContent(translatedHtml, 'q-exp') || payloadToTranslate.explanation;
    
    const translatedOptions = payloadToTranslate.options.map((opt, index) => ({
      id: opt.id,
      text: extractContent(translatedHtml, `opt-${index}`) || opt.text,
    }));

    const translatedData = {
      questionText: translatedQuestionText,
      explanation: translatedExplanation,
      options: translatedOptions,
    };

    // 4. Cache it
    await prisma.translationCache.create({
      data: {
        questionId,
        languageCode: targetLanguage,
        translatedData,
      },
    });

    return NextResponse.json({ translatedData });

  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
