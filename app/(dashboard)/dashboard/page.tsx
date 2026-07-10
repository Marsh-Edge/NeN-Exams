import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, testAttempts, testSchedules } from "@/lib/db/schema";
import { eq, desc, gte } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;
  const now = new Date().toISOString();

  const recentAttempts = await db
    .select({
      id: testAttempts.id,
      score: testAttempts.score,
      totalPoints: testAttempts.totalPoints,
      status: testAttempts.status,
      startedAt: testAttempts.startedAt,
      testTitle: tests.title,
    })
    .from(testAttempts)
    .innerJoin(tests, eq(testAttempts.testId, tests.id))
    .where(eq(testAttempts.userId, user.id))
    .orderBy(desc(testAttempts.startedAt))
    .limit(5);

  const publishedTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      description: tests.description,
      timeLimitMinutes: tests.timeLimitMinutes,
    })
    .from(tests)
    .where(eq(tests.isPublished, true))
    .orderBy(desc(tests.createdAt))
    .limit(5);

  const upcomingTests = await db
    .select({
      id: testSchedules.id,
      scheduledAt: testSchedules.scheduledAt,
      location: testSchedules.location,
      testTitle: tests.title,
    })
    .from(testSchedules)
    .innerJoin(tests, eq(testSchedules.testId, tests.id))
    .where(gte(testSchedules.scheduledAt, now))
    .orderBy(testSchedules.scheduledAt)
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.displayName}
        </h1>
        <p className="text-muted-foreground">
          You are logged in as a{" "}
          <span className="font-medium capitalize text-primary">{user.role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard neon>
          <p className="text-sm text-muted-foreground">Available Tests</p>
          <p className="mt-1 text-3xl font-bold neon-text">
            {publishedTests.length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Tests Taken</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {recentAttempts.length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Upcoming Tests</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {upcomingTests.length}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Avg. Score</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {recentAttempts.length > 0
              ? Math.round(
                  (recentAttempts.reduce((acc, a) => {
                    if (a.score !== null && a.totalPoints > 0) {
                      return acc + (a.score / a.totalPoints) * 100;
                    }
                    return acc;
                  }, 0) /
                    recentAttempts.filter((a) => a.score !== null).length) || 0
                )
              : 0}
            %
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Recent Attempts</h2>
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No test attempts yet. Start by taking a test!
            </p>
          ) : (
            <div className="space-y-3">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{attempt.testTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        attempt.status === "completed"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {attempt.score !== null
                        ? `${attempt.score}/${attempt.totalPoints}`
                        : attempt.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Upcoming Tests</h2>
          {upcomingTests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming tests scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingTests.map((upcoming) => (
                <div
                  key={upcoming.id}
                  className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{upcoming.testTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {upcoming.location || "Online"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {new Date(upcoming.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(upcoming.scheduledAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
