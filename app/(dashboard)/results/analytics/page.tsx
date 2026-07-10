import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  users,
  tests,
  testAttempts,
  comments,
  questions,
} from "@/lib/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || (session.user.role !== "viewer" && session.user.role !== "teacher" && session.user.role !== "organizer" && session.user.role !== "superuser")) {
    redirect("/dashboard");
  }

  const [totalUsers] = await db
    .select({ value: count() })
    .from(users);

  const [totalTests] = await db
    .select({ value: count() })
    .from(tests);

  const [publishedTests] = await db
    .select({ value: count() })
    .from(tests)
    .where(eq(tests.isPublished, true));

  const [totalAttempts] = await db
    .select({ value: count() })
    .from(testAttempts);

  const [completedAttempts] = await db
    .select({ value: count() })
    .from(testAttempts)
    .where(eq(testAttempts.status, "completed"));

  const [totalComments] = await db
    .select({ value: count() })
    .from(comments);

  const [totalQuestions] = await db
    .select({ value: count() })
    .from(questions);

  const usersByRole = await db
    .select({
      role: users.role,
      value: count(),
    })
    .from(users)
    .groupBy(users.role);

  const topTests = await db
    .select({
      testTitle: tests.title,
      attemptCount: count(),
      avgScore: sql<number>`ROUND(AVG(CASE WHEN ${testAttempts.score} IS NOT NULL THEN CAST(${testAttempts.score} AS REAL) / ${testAttempts.totalPoints} * 100 ELSE NULL END), 1)`,
    })
    .from(testAttempts)
    .innerJoin(tests, eq(testAttempts.testId, tests.id))
    .groupBy(tests.id)
    .orderBy(desc(count()))
    .limit(5);

  const recentAttempts = await db
    .select({
      id: testAttempts.id,
      score: testAttempts.score,
      totalPoints: testAttempts.totalPoints,
      status: testAttempts.status,
      startedAt: testAttempts.startedAt,
      testTitle: tests.title,
      username: users.username,
    })
    .from(testAttempts)
    .innerJoin(tests, eq(testAttempts.testId, tests.id))
    .innerJoin(users, eq(testAttempts.userId, users.id))
    .orderBy(desc(testAttempts.startedAt))
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Platform-wide statistics and insights
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard neon>
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="mt-1 text-3xl font-bold neon-text">
            {totalUsers.value}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Published Tests</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {publishedTests.value}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Total Attempts</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {totalAttempts.value}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {totalAttempts.value > 0
              ? Math.round(
                  (completedAttempts.value / totalAttempts.value) * 100
                )
              : 0}
            %
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Users by Role</h3>
          <div className="space-y-3">
            {usersByRole.map((r) => (
              <div
                key={r.role}
                className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
              >
                <span className="capitalize font-medium">{r.role}</span>
                <span className="text-primary font-semibold">{r.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Platform Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
              <span className="text-muted-foreground">Total Questions</span>
              <span className="font-semibold text-primary">
                {totalQuestions.value}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
              <span className="text-muted-foreground">Total Comments</span>
              <span className="font-semibold text-primary">
                {totalComments.value}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
              <span className="text-muted-foreground">
                Draft Tests
              </span>
              <span className="font-semibold text-primary">
                {totalTests.value - publishedTests.value}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {topTests.length > 0 && (
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Most Taken Tests</h3>
          <div className="space-y-3">
            {topTests.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{t.testTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.attemptCount} attempts
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {t.avgScore !== null ? `${t.avgScore}%` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{a.testTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    by @{a.username} &middot;{" "}
                    {new Date(a.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      a.status === "completed"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {a.score !== null
                      ? `${a.score}/${a.totalPoints}`
                      : a.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
