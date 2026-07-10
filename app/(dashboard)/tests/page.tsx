import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, questions, testAttempts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TestsPage() {
  const session = await getSession();
  if (!session) return null;

  const publishedTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      description: tests.description,
      timeLimitMinutes: tests.timeLimitMinutes,
      createdAt: tests.createdAt,
      questionCount: questions.id,
    })
    .from(tests)
    .leftJoin(questions, eq(tests.id, questions.testId))
    .where(eq(tests.isPublished, true))
    .orderBy(desc(tests.createdAt));

  const testMap = new Map<
    string,
    {
      id: string;
      title: string;
      description: string;
      timeLimitMinutes: number;
      createdAt: string;
      questionCount: number;
    }
  >();

  for (const row of publishedTests) {
    if (!testMap.has(row.id)) {
      testMap.set(row.id, {
        id: row.id,
        title: row.title,
        description: row.description,
        timeLimitMinutes: row.timeLimitMinutes,
        createdAt: row.createdAt,
        questionCount: 0,
      });
    }
    if (row.questionCount) {
      const test = testMap.get(row.id)!;
      test.questionCount++;
    }
  }

  const testsList = Array.from(testMap.values());

  const userAttempts = await db
    .select({ testId: testAttempts.testId })
    .from(testAttempts)
    .where(eq(testAttempts.userId, session.user.id));

  const attemptedTestIds = new Set(userAttempts.map((a) => a.testId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tests</h1>
        <p className="text-muted-foreground">
          {session.user.role === "student"
            ? "Browse and take available tests"
            : "Available tests"}
        </p>
      </div>

      {testsList.length === 0 ? (
        <GlassCard>
          <p className="text-muted-foreground">
            No tests available yet.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testsList.map((test) => {
            const attempted = attemptedTestIds.has(test.id);
            return (
              <GlassCard key={test.id} className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{test.title}</h3>
                    {attempted && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary text-xs"
                      >
                        Attempted
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {test.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{test.questionCount} questions</span>
                    <span>{test.timeLimitMinutes} min</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/tests/${test.id}`}>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                    >
                      {session.user.role === "student"
                        ? attempted
                          ? "Retake"
                          : "Start Test"
                        : "View Details"}
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
