"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["multiple_choice", "true_false", "short_answer"]),
  options: z.string().optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  points: z.number().min(1).default(1),
});

const createTestSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  timeLimitMinutes: z.number().min(1).max(180).default(30),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export type CreateTestInput = z.infer<typeof createTestSchema>;

export async function createTest(input: CreateTestInput) {
  const session = await getSession();
  if (!session || session.user.role !== "teacher") {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const parsed = createTestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, description, timeLimitMinutes, questions: questionData } = parsed.data;

  const testId = crypto.randomUUID();

  await db.insert(tests).values({
    id: testId,
    title,
    description,
    creatorId: session.user.id,
    timeLimitMinutes,
    isPublished: false,
  });

  for (let i = 0; i < questionData.length; i++) {
    const q = questionData[i];
    await db.insert(questions).values({
      id: crypto.randomUUID(),
      testId,
      text: q.text,
      type: q.type,
      options: q.options || null,
      correctAnswer: q.correctAnswer,
      orderIndex: i,
      points: q.points,
    });
  }

  return { success: true, testId };
}

export async function publishTest(testId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "teacher") {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  if (!test[0] || test[0].creatorId !== session.user.id) {
    return { success: false, error: { _form: ["Test not found"] } };
  }

  await db
    .update(tests)
    .set({ isPublished: true, updatedAt: new Date().toISOString() })
    .where(eq(tests.id, testId));

  return { success: true };
}

export async function unpublishTest(testId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "teacher") {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  if (!test[0] || test[0].creatorId !== session.user.id) {
    return { success: false, error: { _form: ["Test not found"] } };
  }

  await db
    .update(tests)
    .set({ isPublished: false, updatedAt: new Date().toISOString() })
    .where(eq(tests.id, testId));

  return { success: true };
}

export async function deleteTest(testId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "teacher") {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  if (!test[0] || test[0].creatorId !== session.user.id) {
    return { success: false, error: { _form: ["Test not found"] } };
  }

  await db.delete(tests).where(eq(tests.id, testId));

  return { success: true };
}
