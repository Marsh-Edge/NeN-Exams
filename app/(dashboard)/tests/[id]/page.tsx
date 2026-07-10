import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tests, questions, testAttempts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const test = await db
    .select()
    .from(tests)
    .where(eq(tests.id, id))
    .limit(1);

  if (!test[0]) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Test Not Found</h1>
        <Link href="/tests">
          <Button variant="outline" className="rounded-xl">
            Back to Tests
          </Button>
        </Link>
      </div>
    );
  }

  const questionList = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, id))
    .orderBy(questions.orderIndex);

  const totalPoints = questionList.reduce((sum, q) => sum + q.points, 0);

  let previousAttempt = null;
  if (session.user.role === "student") {
    const attempts = await db
      .select()
      .from(testAttempts)
      .where(
        and(
          eq(testAttempts.testId, id),
          eq(testAttempts.userId, session.user.id)
        )
      )
      .orderBy(testAttempts.startedAt)
      .limit(5);

    previousAttempt = attempts[attempts.length - 1] || null;
  }

  const canTake =
    session.user.role === "student" && test[0].isPublished;

  return (
    <div className="space-y-6">
      <Link href="/tests">
        <Button variant="ghost" className="rounded-xl">
          &larr; Back to Tests
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{test[0].title}</h1>
                  <Badge
                    variant={test[0].isPublished ? "default" : "secondary"}
                    className={
                      test[0].isPublished
                        ? "bg-primary/20 text-primary"
                        : ""
                    }
                  >
                    {test[0].isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {test[0].description}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 text-lg font-semibold">
              Questions ({questionList.length})
            </h3>
            {questionList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {questionList.map((q, i) => (
                  <div
                    key={q.id}
                    className="rounded-xl bg-accent/50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          <span className="text-muted-foreground">
                            Q{i + 1}.
                          </span>{" "}
                          {q.text}
                        </p>
                        {q.type === "multiple_choice" && q.options && (
                          <div className="mt-2 space-y-1">
                            {q.options
                              .split("\n")
                              .filter((o) => o.trim())
                              .map((opt, j) => (
                                <p
                                  key={j}
                                  className="ml-4 text-sm text-muted-foreground"
                                >
                                  {String.fromCharCode(65 + j)}. {opt.trim()}
                                </p>
                              ))}
                          </div>
                        )}
                        {q.type === "true_false" && (
                          <p className="mt-2 ml-4 text-sm text-muted-foreground">
                            A. True &nbsp;&nbsp; B. False
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {q.points} {q.points === 1 ? "pt" : "pts"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard neon>
            <h3 className="mb-4 text-lg font-semibold">Test Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time Limit</span>
                <span className="font-medium">
                  {test[0].timeLimitMinutes} min
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{questionList.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
            </div>
          </GlassCard>

          {canTake && (
            <GlassCard>
              <Link href={`/tests/${id}/take`} className="block">
                <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)] transition-all duration-300 hover:shadow-[0_0_25px_var(--neon-glow)]" size="lg">
                  {previousAttempt
                    ? previousAttempt.status === "completed"
                      ? "Retake Test"
                      : "Continue Test"
                    : "Start Test"}
                </Button>
              </Link>
            </GlassCard>
          )}

          {previousAttempt && previousAttempt.status === "completed" && (
            <GlassCard>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Last Attempt
              </h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {previousAttempt.score}/{previousAttempt.totalPoints}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round(
                    (previousAttempt.score! /
                      previousAttempt.totalPoints) *
                      100
                  )}
                  % score
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    previousAttempt.completedAt || previousAttempt.startedAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
