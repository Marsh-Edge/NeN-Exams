"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { comments, tests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const addCommentSchema = z.object({
  testId: z.string().min(1, "Test is required"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be at most 1000 characters"),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;

export async function addComment(input: AddCommentInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { testId, content } = parsed.data;

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  if (!test[0]) {
    return { success: false, error: { _form: ["Test not found"] } };
  }

  await db.insert(comments).values({
    id: crypto.randomUUID(),
    testId,
    userId: session.user.id,
    content,
  });

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment[0] || comment[0].userId !== session.user.id) {
    return { success: false, error: "Not found" };
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  return { success: true };
}
