import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyQbankAccess } from "@/lib/verifyQbankAccess";
import { getCachedOrFetch } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { 
      qbankId, 
      qbankSlug, 
      qbankIds = [], 
      mode, 
      filter = "all", 
      subtopics = [], 
      questionCount 
    } = await req.json();

    if ((!qbankId && !qbankSlug && qbankIds.length === 0) || !mode) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Resolve target QBank IDs
    let targetQBankIds: string[] = [];
    if (qbankIds && qbankIds.length > 0) {
      targetQBankIds = qbankIds;
    } else if (qbankId) {
      targetQBankIds = [qbankId];
    } else if (qbankSlug) {
      const qbank = await prisma.qBank.findUnique({ where: { slug: qbankSlug } });
      if (!qbank) return new NextResponse("QBank not found", { status: 404 });
      targetQBankIds = [qbank.id];
    }

    // Verify access to all selected QBanks (admin bypass handles admin)
    for (const bId of targetQBankIds) {
      await verifyQbankAccess(session.user.id, bId);
    }

    // Fetch published questions across selected QBanks
    let questions = await prisma.question.findMany({
      where: {
        qbankId: { in: targetQBankIds },
        status: "PUBLISHED"
      },
      orderBy: { qid: "asc" }
    });

    // Apply question filters when advanced filters are requested
    if (filter !== "all" || subtopics.length > 0) {
      const userProgress = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          qbankId: { in: targetQBankIds }
        },
        select: { questionId: true, selectedAnswer: true, isCorrect: true, flagged: true },
      });

      const progressMap = new Map(userProgress.map((p) => [p.questionId, p]));
      const answeredIds = new Set(userProgress.filter((p) => p.selectedAnswer).map((p) => p.questionId));

      if (filter === "unused") {
        questions = questions.filter((q) => !answeredIds.has(q.id));
      } else if (filter === "incorrect") {
        questions = questions.filter((q) => {
          const p = progressMap.get(q.id);
          return p && p.isCorrect === false;
        });
      } else if (filter === "flagged") {
        questions = questions.filter((q) => {
          const p = progressMap.get(q.id);
          return p && p.flagged === true;
        });
      }

      if (subtopics.length > 0) {
        questions = questions.filter((q) => q.subtopic && subtopics.includes(q.subtopic));
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({ error: "No questions match the selected filters." }, { status: 400 });
    }

    // Shuffle for exam randomness
    questions = [...questions].sort(() => Math.random() - 0.5);

    // Limit question count if specified (max 40 per USMLE block)
    const maxBlockCount = questionCount && questionCount > 0 ? Math.min(questionCount, 40) : Math.min(questions.length, 40);
    questions = questions.slice(0, maxBlockCount);

    const primaryQBankId = targetQBankIds[0];
    const durationSec = mode === "timed" ? questions.length * 90 : null;

    const testSession = await prisma.testSession.create({
      data: {
        userId: session.user.id,
        qbankId: primaryQBankId,
        mode,
        durationSec,
        status: "in_progress",
      },
    });

    if (questions.length > 0) {
      await prisma.userProgress.createMany({
        data: questions.map((q) => ({
          userId: session.user.id,
          qbankId: q.qbankId,
          questionId: q.id,
          testSessionId: testSession.id,
          flagged: false,
        })),
        skipDuplicates: true,
      });
    }

    // Also get the primary qbank slug for URL redirection
    const primaryQBank = await prisma.qBank.findUnique({
      where: { id: primaryQBankId },
      select: { slug: true }
    });

    return NextResponse.json({ 
      sessionId: testSession.id, 
      qbankSlug: primaryQBank?.slug || 'custom-block',
      questionCount: questions.length 
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ForbiddenError") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    console.error("[TEST_SESSION_CREATE_ERROR]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
