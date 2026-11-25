import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyQbankAccess } from "@/lib/verifyQbankAccess";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ qbankSlug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;

  try {
    const qbank = await prisma.qBank.findUnique({
      where: { slug: params.qbankSlug },
      select: { id: true, title: true, totalQuestions: true },
    });

    if (!qbank) {
      return NextResponse.json({ error: "QBank not found" }, { status: 404 });
    }

    // Verify access
    await verifyQbankAccess(session.user.id, qbank.id);

    const [progress, firstTutorSession, subtopicRows] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: session.user.id, qbankId: qbank.id, selectedAnswer: { not: null } },
        select: { questionId: true, isCorrect: true, flagged: true },
      }),
      prisma.testSession.findFirst({
        where: { userId: session.user.id, qbankId: qbank.id, status: "completed", mode: "tutor" },
        select: { id: true },
      }),
      prisma.question.findMany({
        where: { qbankId: qbank.id, status: "PUBLISHED", subtopic: { not: null } },
        select: { subtopic: true },
        distinct: ["subtopic"],
        orderBy: { subtopic: "asc" },
      }),
    ]);

    const completedQuestions = new Set(progress.map((p) => p.questionId)).size;
    const incorrectCount = progress.filter((p) => p.isCorrect === false).length;
    const flaggedCount = progress.filter((p) => p.flagged).length;
    const unusedCount = Math.max(0, qbank.totalQuestions - completedQuestions);

    return NextResponse.json({
      title: qbank.title,
      totalQuestions: qbank.totalQuestions,
      completedQuestions,
      unusedCount,
      incorrectCount,
      flaggedCount,
      reviewSessionId: firstTutorSession?.id ?? null,
      subtopics: subtopicRows.map((r) => r.subtopic).filter(Boolean),
    });
  } catch (error: any) {
    if (error?.name === 'ForbiddenError') {
      return NextResponse.json({ error: "Forbidden: Question bank is locked." }, { status: 403 });
    }
    console.error("Failed to fetch qbank progress", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
