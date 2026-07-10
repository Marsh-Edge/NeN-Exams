import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tests, testSchedules } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { ScheduleTestClient } from "./schedule-test-client";
import { DeleteScheduleButton } from "./delete-schedule-button";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session || session.user.role !== "organizer") {
    redirect("/dashboard");
  }

  const publishedTests = await db
    .select({
      id: tests.id,
      title: tests.title,
    })
    .from(tests)
    .where(eq(tests.isPublished, true))
    .orderBy(desc(tests.createdAt));

  const now = new Date().toISOString();

  const mySchedules = await db
    .select({
      id: testSchedules.id,
      scheduledAt: testSchedules.scheduledAt,
      location: testSchedules.location,
      testTitle: tests.title,
      testId: tests.id,
    })
    .from(testSchedules)
    .innerJoin(tests, eq(testSchedules.testId, tests.id))
    .where(eq(testSchedules.createdBy, session.user.id))
    .orderBy(desc(testSchedules.scheduledAt));

  const upcoming = mySchedules.filter((s) => s.scheduledAt >= now);
  const past = mySchedules.filter((s) => s.scheduledAt < now);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule Tests</h1>
        <p className="text-muted-foreground">
          Organize and schedule test events
        </p>
      </div>

      <ScheduleTestClient publishedTests={publishedTests} />

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Upcoming Scheduled</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming scheduled tests.
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{s.testTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.location || "Online"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {new Date(s.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.scheduledAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <DeleteScheduleButton scheduleId={s.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {past.length > 0 && (
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold text-muted-foreground">
            Past Scheduled
          </h3>
          <div className="space-y-3">
            {past.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-accent/30 px-4 py-3 opacity-60"
              >
                <div>
                  <p className="font-medium">{s.testTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.location || "Online"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(s.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
