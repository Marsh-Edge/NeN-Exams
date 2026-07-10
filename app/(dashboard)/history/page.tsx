import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, testAttempts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;
  const whereClause =
    user.role === "student"
      ? eq(testAttempts.userId, user.id)
      : user.role === "teacher"
        ? eq(tests.creatorId, user.id)
        : undefined;

  const baseQuery = db
    .select({
      id: testAttempts.id,
      score: testAttempts.score,
      totalPoints: testAttempts.totalPoints,
      status: testAttempts.status,
      startedAt: testAttempts.startedAt,
      completedAt: testAttempts.completedAt,
      testId: tests.id,
      testTitle: tests.title,
      username: users.username,
      displayName: users.displayName,
    })
    .from(testAttempts)
    .innerJoin(tests, eq(testAttempts.testId, tests.id))
    .innerJoin(users, eq(testAttempts.userId, users.id));

  const history = whereClause
    ? await baseQuery
        .where(whereClause)
        .orderBy(desc(testAttempts.startedAt))
        .limit(50)
    : await baseQuery
        .orderBy(desc(testAttempts.startedAt))
        .limit(50);

  const totalAttempts = history.length;
  const completedAttempts = history.filter(
    (h) => h.status === "completed"
  ).length;
  const avgScore =
    history.filter((h) => h.score !== null).length > 0
      ? Math.round(
          history
            .filter((h) => h.score !== null)
            .reduce(
              (acc, h) => acc + (h.score! / h.totalPoints) * 100,
              0
            ) /
            history.filter((h) => h.score !== null).length
        )
      : 0;

  const uniqueTests = new Set(history.map((h) => h.testId)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">
          {user.role === "student"
            ? "Your test history"
            : user.role === "teacher"
              ? "History of your tests"
              : "All test activity"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard neon>
          <p className="text-sm text-muted-foreground">Total Attempts</p>
          <p className="mt-1 text-3xl font-bold neon-text">{totalAttempts}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {completedAttempts}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Avg. Score</p>
          <p className="mt-1 text-3xl font-bold text-primary">{avgScore}%</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Unique Tests</p>
          <p className="mt-1 text-3xl font-bold text-primary">{uniqueTests}</p>
        </GlassCard>
      </div>

      {history.length === 0 ? (
        <GlassCard>
          <p className="text-muted-foreground">No history yet.</p>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="space-y-3">
            {history.map((h) => {
              const scorePercent =
                h.score !== null && h.totalPoints > 0
                  ? Math.round((h.score / h.totalPoints) * 100)
                  : null;
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/tests/${h.testId}`}
                        className="font-medium hover:underline"
                      >
                        {h.testTitle}
                      </Link>
                      <Badge
                        variant={
                          h.status === "completed"
                            ? "default"
                            : h.status === "timed_out"
                              ? "destructive"
                              : "secondary"
                        }
                        className={
                          h.status === "completed"
                            ? "bg-primary/20 text-primary text-xs"
                            : "text-xs"
                        }
                      >
                        {h.status === "completed"
                          ? "Completed"
                          : h.status === "timed_out"
                            ? "Timed Out"
                            : "In Progress"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.role !== "student" && (
                        <>
                          @{h.username} &middot;{" "}
                        </>
                      )}
                      {new Date(h.startedAt).toLocaleString()}
                      {h.completedAt && (
                        <>
                          {" "}
                          &rarr;{" "}
                          {new Date(h.completedAt).toLocaleTimeString()}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    {h.score !== null ? (
                      <>
                        <p
                          className={`font-semibold ${
                            scorePercent! >= 70
                              ? "text-primary"
                              : scorePercent! >= 50
                                ? "text-yellow-500"
                                : "text-destructive"
                          }`}
                        >
                          {h.score}/{h.totalPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scorePercent}%
                        </p>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
