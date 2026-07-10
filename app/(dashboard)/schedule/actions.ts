"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { testSchedules, tests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const scheduleTestSchema = z.object({
  testId: z.string().min(1, "Test is required"),
  scheduledAt: z.string().min(1, "Schedule date is required"),
  location: z.string().optional(),
});

export type ScheduleTestInput = z.infer<typeof scheduleTestSchema>;

export async function scheduleTest(input: ScheduleTestInput) {
  const session = await getSession();
  if (!session || session.user.role !== "organizer") {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const parsed = scheduleTestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { testId, scheduledAt, location } = parsed.data;

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, testId))
    .limit(1);

  if (!test[0]) {
    return { success: false, error: { _form: ["Test not found"] } };
  }

  await db.insert(testSchedules).values({
    id: crypto.randomUUID(),
    testId,
    scheduledAt: new Date(scheduledAt).toISOString(),
    location: location || null,
    createdBy: session.user.id,
  });

  return { success: true };
}

export async function deleteSchedule(scheduleId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "organizer") {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const schedule = await db
    .select()
    .from(testSchedules)
    .where(eq(testSchedules.id, scheduleId))
    .limit(1);

  if (!schedule[0] || schedule[0].createdBy !== session.user.id) {
    return { success: false, error: { _form: ["Schedule not found"] } };
  }

  await db.delete(testSchedules).where(eq(testSchedules.id, scheduleId));

  return { success: true };
}
