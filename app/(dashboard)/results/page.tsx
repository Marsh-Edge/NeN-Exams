import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, testAttempts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";

interface ResultRow {
  id: string;
  score: number | null;
  totalPoints: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  testTitle: string;
  username?: string;
  displayName?: string;
}

export default async function ResultsPage() {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;

  let results: ResultRow[];

  if (user.role === "student") {
    const rows = await db
      .select({
        id: testAttempts.id,
        score: testAttempts.score,
        totalPoints: testAttempts.totalPoints,
        status: testAttempts.status,
        startedAt: testAttempts.startedAt,
        completedAt: testAttempts.completedAt,
        testTitle: tests.title,
      })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .where(eq(testAttempts.userId, user.id))
      .orderBy(desc(testAttempts.startedAt));
    results = rows;
  } else if (user.role === "teacher") {
    const rows = await db
      .select({
        id: testAttempts.id,
        score: testAttempts.score,
        totalPoints: testAttempts.totalPoints,
        status: testAttempts.status,
        startedAt: testAttempts.startedAt,
        completedAt: testAttempts.completedAt,
        testTitle: tests.title,
        username: users.username,
        displayName: users.displayName,
      })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .innerJoin(users, eq(testAttempts.userId, users.id))
      .where(eq(tests.creatorId, user.id))
      .orderBy(desc(testAttempts.startedAt));
    results = rows;
  } else {
    const rows = await db
      .select({
        id: testAttempts.id,
        score: testAttempts.score,
        totalPoints: testAttempts.totalPoints,
        status: testAttempts.status,
        startedAt: testAttempts.startedAt,
        completedAt: testAttempts.completedAt,
        testTitle: tests.title,
        username: users.username,
        displayName: users.displayName,
      })
      .from(testAttempts)
      .innerJoin(tests, eq(testAttempts.testId, tests.id))
      .innerJoin(users, eq(testAttempts.userId, users.id))
      .orderBy(desc(testAttempts.startedAt))
      .limit(50);
    results = rows;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-muted-foreground">
          {user.role === "student"
            ? "Your test results"
            : user.role === "teacher"
              ? "Results on your tests"
              : "All test results"}
        </p>
      </div>

      {results.length === 0 ? (
        <GlassCard>
          <p className="text-muted-foreground">No results yet.</p>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="space-y-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{r.testTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.displayName
                      ? `${r.displayName} (@${r.username})`
                      : "You"}{" "}
                    &middot;{" "}
                    {new Date(r.startedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      r.status === "completed"
                        ? "default"
                        : r.status === "timed_out"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      r.status === "completed"
                        ? "bg-primary/20 text-primary"
                        : ""
                    }
                  >
                    {r.status === "completed"
                      ? "Completed"
                      : r.status === "timed_out"
                        ? "Timed Out"
                        : "In Progress"}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {r.score !== null
                        ? `${r.score}/${r.totalPoints}`
                        : "-"}
                    </p>
                    {r.score !== null && r.totalPoints > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round((r.score / r.totalPoints) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
