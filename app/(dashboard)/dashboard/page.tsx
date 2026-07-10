import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  tests,
  testAttempts,
  testSchedules,
  comments,
  users,
} from "@/lib/db/schema";
import { eq, desc, gte, count, sql } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  let teacherStats = null;
  let organizerStats = null;
  let viewerStats = null;

  if (user.role === "teacher") {
    const [myTests] = await db
      .select({ value: count() })
      .from(tests)
      .where(eq(tests.creatorId, user.id));

    const [myPublishedTests] = await db
      .select({ value: count() })
      .from(tests)
      .where(sql`${tests.creatorId} = ${user.id} AND ${tests.isPublished} = 1`);

    const [totalAttemptsOnMyTests] = await db
      .select({ value: count() })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .where(eq(tests.creatorId, user.id));

    teacherStats = {
      totalTests: myTests.value,
      publishedTests: myPublishedTests.value,
      totalAttempts: totalAttemptsOnMyTests.value,
    };
  }

  if (user.role === "organizer") {
    const [totalScheduled] = await db
      .select({ value: count() })
      .from(testSchedules)
      .where(eq(testSchedules.createdBy, user.id));

    const [upcomingScheduled] = await db
      .select({ value: count() })
      .from(testSchedules)
      .where(
        sql`${testSchedules.createdBy} = ${user.id} AND ${testSchedules.scheduledAt} >= ${now}`
      );

    organizerStats = {
      totalScheduled: totalScheduled.value,
      upcoming: upcomingScheduled.value,
    };
  }

  if (user.role === "viewer") {
    const [totalUsers] = await db
      .select({ value: count() })
      .from(users);

    const [totalTests] = await db
      .select({ value: count() })
      .from(tests)
      .where(eq(tests.isPublished, true));

    const [totalAttempts] = await db
      .select({ value: count() })
      .from(testAttempts);

    const [totalComments] = await db
      .select({ value: count() })
      .from(comments);

    viewerStats = {
      totalUsers: totalUsers.value,
      totalTests: totalTests.value,
      totalAttempts: totalAttempts.value,
      totalComments: totalComments.value,
    };
  }

  const avgScore =
    recentAttempts.filter((a) => a.score !== null).length > 0
      ? Math.round(
          (recentAttempts.reduce((acc, a) => {
            if (a.score !== null && a.totalPoints > 0) {
              return acc + (a.score / a.totalPoints) * 100;
            }
            return acc;
          }, 0) /
            recentAttempts.filter((a) => a.score !== null).length)
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.displayName}
        </h1>
        <p className="text-muted-foreground">
          You are logged in as a{" "}
          <span className="font-medium capitalize text-primary">
            {user.role}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {user.role === "student" && (
          <>
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
                {avgScore}%
              </p>
            </GlassCard>
          </>
        )}

        {user.role === "teacher" && teacherStats && (
          <>
            <GlassCard neon>
              <p className="text-sm text-muted-foreground">My Tests</p>
              <p className="mt-1 text-3xl font-bold neon-text">
                {teacherStats.totalTests}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {teacherStats.publishedTests}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {teacherStats.totalAttempts}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {avgScore}%
              </p>
            </GlassCard>
          </>
        )}

        {user.role === "organizer" && organizerStats && (
          <>
            <GlassCard neon>
              <p className="text-sm text-muted-foreground">Scheduled Tests</p>
              <p className="mt-1 text-3xl font-bold neon-text">
                {organizerStats.totalScheduled}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {organizerStats.upcoming}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Available Tests</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {publishedTests.length}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Upcoming Tests</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {upcomingTests.length}
              </p>
            </GlassCard>
          </>
        )}

        {user.role === "viewer" && viewerStats && (
          <>
            <GlassCard neon>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="mt-1 text-3xl font-bold neon-text">
                {viewerStats.totalUsers}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Published Tests</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {viewerStats.totalTests}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {viewerStats.totalAttempts}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm text-muted-foreground">Total Comments</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {viewerStats.totalComments}
              </p>
            </GlassCard>
          </>
        )}
      </div>

      {user.role === "teacher" && (
        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <Link href="/tests/create">
              <Button className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)]">
                Create New Test
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}

      {user.role === "organizer" && (
        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <Link href="/schedule">
              <Button className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)]">
                Schedule Test
              </Button>
            </Link>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">
            {user.role === "student"
              ? "Recent Attempts"
              : user.role === "teacher"
                ? "Recent Submissions"
                : "Recent Activity"}
          </h2>
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {user.role === "student"
                ? "No test attempts yet. Start by taking a test!"
                : user.role === "teacher"
                  ? "No submissions on your tests yet."
                  : "No recent activity."}
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
          <h2 className="mb-4 text-lg font-semibold">
            {user.role === "student"
              ? "Available Tests"
              : "Upcoming Tests"}
          </h2>
          {(user.role === "student" ? publishedTests : upcomingTests).length ===
          0 ? (
            <p className="text-sm text-muted-foreground">
              {user.role === "student"
                ? "No tests available yet."
                : "No upcoming tests scheduled."}
            </p>
          ) : (
            <div className="space-y-3">
              {(user.role === "student" ? publishedTests : upcomingTests).map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {"title" in item ? item.title : item.testTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {"description" in item
                          ? (item as { description: string }).description
                          : "scheduledAt" in item
                            ? (item as { scheduledAt: string }).scheduledAt
                            : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      {"timeLimitMinutes" in item && (
                        <p className="font-semibold text-primary">
                          {item.timeLimitMinutes} min
                        </p>
                      )}
                      {"scheduledAt" in item && (
                        <>
                          <p className="font-semibold text-primary">
                            {new Date(
                              (item as { scheduledAt: string }).scheduledAt
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              (item as { scheduledAt: string }).scheduledAt
                            ).toLocaleTimeString()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
