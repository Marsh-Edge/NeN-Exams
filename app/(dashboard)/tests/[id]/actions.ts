"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, questions, testAttempts, answers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function startTest(testId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "student") {
    return { success: false, error: "Unauthorized" };
  }

  const test = await db
    .select()
    .from(tests)
    .where(and(eq(tests.id, testId), eq(tests.isPublished, true)))
    .limit(1);

  if (!test[0]) {
    return { success: false, error: "Test not found or not published" };
  }

  const existingInProgress = await db
    .select()
    .from(testAttempts)
    .where(
      and(
        eq(testAttempts.testId, testId),
        eq(testAttempts.userId, session.user.id),
        eq(testAttempts.status, "in_progress")
      )
    )
    .limit(1);

  if (existingInProgress[0]) {
    return {
      success: true,
      attemptId: existingInProgress[0].id,
      startedAt: existingInProgress[0].startedAt,
      timeLimitMinutes: test[0].timeLimitMinutes,
    };
  }

  const questionList = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, testId));

  const totalPoints = questionList.reduce((sum, q) => sum + q.points, 0);

  const attemptId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  await db.insert(testAttempts).values({
    id: attemptId,
    testId,
    userId: session.user.id,
    status: "in_progress",
    totalPoints,
    startedAt,
  });

  return {
    success: true,
    attemptId,
    startedAt,
    timeLimitMinutes: test[0].timeLimitMinutes,
  };
}

export async function getTestForTaking(testId: string) {
  const session = await getSession();
  if (!session) return null;

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  if (!test[0]) return null;

  const questionList = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, testId))
    .orderBy(questions.orderIndex);

  return {
    test: test[0],
    questions: questionList,
  };
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  answer: string
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const attempt = await db
    .select()
    .from(testAttempts)
    .where(
      and(
        eq(testAttempts.id, attemptId),
        eq(testAttempts.userId, session.user.id),
        eq(testAttempts.status, "in_progress")
      )
    )
    .limit(1);

  if (!attempt[0]) {
    return { success: false, error: "No active attempt" };
  }

  const now = new Date().toISOString();
  const startedAt = new Date(attempt[0].startedAt).getTime();
  const testRecord = await db
    .select()
    .from(tests)
    .where(eq(tests.id, attempt[0].testId))
    .limit(1);

  if (testRecord[0]) {
    const elapsed = (now as unknown as number) - startedAt;
    const limit =
      testRecord[0].timeLimitMinutes * 60 * 1000;
    if (elapsed > limit) {
      await db
        .update(testAttempts)
        .set({ status: "timed_out", completedAt: now })
        .where(eq(testAttempts.id, attemptId));
      return { success: false, error: "Time limit exceeded" };
    }
  }

  const existingAnswer = await db
    .select()
    .from(answers)
    .where(
      and(
        eq(answers.attemptId, attemptId),
        eq(answers.questionId, questionId)
      )
    )
    .limit(1);

  if (existingAnswer[0]) {
    await db
      .update(answers)
      .set({ answer, answeredAt: now })
      .where(eq(answers.id, existingAnswer[0].id));
  } else {
    await db.insert(answers).values({
      id: crypto.randomUUID(),
      attemptId,
      questionId,
      answer,
      answeredAt: now,
    });
  }

  return { success: true };
}

export async function finishTest(attemptId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const attempt = await db
    .select()
    .from(testAttempts)
    .where(
      and(
        eq(testAttempts.id, attemptId),
        eq(testAttempts.userId, session.user.id),
        eq(testAttempts.status, "in_progress")
      )
    )
    .limit(1);

  if (!attempt[0]) {
    return { success: false, error: "No active attempt" };
  }

  const now = new Date().toISOString();

  const questionList = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, attempt[0].testId));

  const answerList = await db
    .select()
    .from(answers)
    .where(eq(answers.attemptId, attemptId));

  const answerMap = new Map(answerList.map((a) => [a.questionId, a]));

  let score = 0;
  for (const q of questionList) {
    const userAnswer = answerMap.get(q.id);
    if (userAnswer) {
      const isCorrect =
        userAnswer.answer.trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase();
      await db
        .update(answers)
        .set({ isCorrect })
        .where(eq(answers.id, userAnswer.id));
      if (isCorrect) {
        score += q.points;
      }
    }
  }

  await db
    .update(testAttempts)
    .set({
      status: "completed",
      score,
      completedAt: now,
    })
    .where(eq(testAttempts.id, attemptId));

  return { success: true, score, totalPoints: attempt[0].totalPoints };
}

export async function getAttemptResults(attemptId: string) {
  const session = await getSession();
  if (!session) return null;

  const attempt = await db
    .select()
    .from(testAttempts)
    .where(eq(testAttempts.id, attemptId))
    .limit(1);

  if (!attempt[0]) return null;

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, attempt[0].testId))
    .limit(1);

  const questionList = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, attempt[0].testId))
    .orderBy(questions.orderIndex);

  const answerList = await db
    .select()
    .from(answers)
    .where(eq(answers.attemptId, attemptId));

  const answerMap = new Map(answerList.map((a) => [a.questionId, a]));

  const questionsWithAnswers = questionList.map((q) => {
    const userAnswer = answerMap.get(q.id);
    return {
      ...q,
      userAnswer: userAnswer?.answer || null,
      isCorrect: userAnswer?.isCorrect ?? null,
    };
  });

  return {
    attempt: attempt[0],
    test: test[0],
    questions: questionsWithAnswers,
  };
}

export async function checkTimeRemaining(attemptId: string) {
  const session = await getSession();
  if (!session) return null;

  const attempt = await db
    .select()
    .from(testAttempts)
    .where(eq(testAttempts.id, attemptId))
    .limit(1);

  if (!attempt[0] || attempt[0].status !== "in_progress") {
    return { expired: true };
  }

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, attempt[0].testId))
    .limit(1);

  if (!test[0]) return { expired: true };

  const elapsed =
    Date.now() - new Date(attempt[0].startedAt).getTime();
  const limit = test[0].timeLimitMinutes * 60 * 1000;
  const remaining = limit - elapsed;

  if (remaining <= 0) {
    await finishTest(attemptId);
    return { expired: true };
  }

  return { expired: false, remainingMs: remaining };
}
