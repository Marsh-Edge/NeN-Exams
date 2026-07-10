import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { tests, questions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublishToggle } from "./publish-toggle";
import { DeleteTestButton } from "./delete-test-button";

export default async function MyTestsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "teacher") {
    return null;
  }

  const myTests = await db
    .select({
      id: tests.id,
      title: tests.title,
      description: tests.description,
      timeLimitMinutes: tests.timeLimitMinutes,
      isPublished: tests.isPublished,
      createdAt: tests.createdAt,
      questionCount: questions.id,
    })
    .from(tests)
    .leftJoin(questions, eq(tests.id, questions.testId))
    .where(eq(tests.creatorId, session.user.id))
    .orderBy(desc(tests.createdAt));

  const testMap = new Map<
    string,
    {
      id: string;
      title: string;
      description: string;
      timeLimitMinutes: number;
      isPublished: boolean;
      createdAt: string;
      questionCount: number;
    }
  >();

  for (const row of myTests) {
    if (!testMap.has(row.id)) {
      testMap.set(row.id, {
        id: row.id,
        title: row.title,
        description: row.description,
        timeLimitMinutes: row.timeLimitMinutes,
        isPublished: row.isPublished,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Tests</h1>
          <p className="text-muted-foreground">
            Manage your created tests
          </p>
        </div>
        <Link href="/tests/create">
          <Button className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)]">
            Create New Test
          </Button>
        </Link>
      </div>

      {testsList.length === 0 ? (
        <GlassCard>
          <div className="text-center">
            <p className="text-muted-foreground">
              You haven&apos;t created any tests yet.
            </p>
            <Link href="/tests/create" className="mt-4 inline-block">
              <Button className="rounded-xl">Create Your First Test</Button>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {testsList.map((test) => (
            <GlassCard key={test.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{test.title}</h3>
                    <Badge
                      variant={test.isPublished ? "default" : "secondary"}
                      className={
                        test.isPublished
                          ? "bg-primary/20 text-primary"
                          : ""
                      }
                    >
                      {test.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {test.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{test.questionCount} questions</span>
                    <span>{test.timeLimitMinutes} min</span>
                    <span>
                      Created{" "}
                      {new Date(test.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PublishToggle
                    testId={test.id}
                    isPublished={test.isPublished}
                  />
                  <DeleteTestButton testId={test.id} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
