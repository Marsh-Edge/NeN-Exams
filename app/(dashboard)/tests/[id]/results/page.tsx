import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getAttemptResults } from "../actions";
import { GlassCard } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function TestResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    redirect(`/tests/${id}`);
  }

  const results = await getAttemptResults(attemptId);
  if (!results) {
    redirect(`/tests/${id}`);
  }

  const { attempt, test, questions: questionsWithAnswers } = results;
  const scorePercent =
    attempt.totalPoints > 0 && attempt.score !== null
      ? Math.round((attempt.score / attempt.totalPoints) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <Link href="/tests">
        <Button variant="ghost" className="rounded-xl">
          &larr; Back to Tests
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard neon>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{test?.title}</h1>
              <Badge
                variant="default"
                className="mt-2 bg-primary/20 text-primary"
              >
                {attempt.status === "completed" ? "Completed" : "Timed Out"}
              </Badge>
            </div>

            <div className="mt-6 flex items-center justify-center gap-8">
              <div className="text-center">
                <p
                  className={cn(
                    "text-5xl font-bold",
                    scorePercent >= 70
                      ? "text-primary"
                      : scorePercent >= 50
                        ? "text-yellow-500"
                        : "text-destructive"
                  )}
                >
                  {attempt.score}/{attempt.totalPoints}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scorePercent}% score
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
              <span>
                Started:{" "}
                {new Date(attempt.startedAt).toLocaleString()}
              </span>
              {attempt.completedAt && (
                <span>
                  Completed:{" "}
                  {new Date(attempt.completedAt).toLocaleString()}
                </span>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 text-lg font-semibold">Review Answers</h3>
            <div className="space-y-4">
              {questionsWithAnswers.map((q, i) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-border p-4"
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
                            .map((opt, j) => {
                              const letter = String.fromCharCode(65 + j);
                              const isCorrectOpt =
                                opt.trim().toLowerCase() ===
                                q.correctAnswer.trim().toLowerCase();
                              const isUserAnswer =
                                q.userAnswer?.trim().toLowerCase() ===
                                opt.trim().toLowerCase();
                              return (
                                <p
                                  key={j}
                                  className={cn(
                                    "ml-4 text-sm",
                                    isCorrectOpt
                                      ? "font-medium text-primary"
                                      : isUserAnswer && !isCorrectOpt
                                        ? "text-destructive line-through"
                                        : "text-muted-foreground"
                                  )}
                                >
                                  {letter}. {opt.trim()}
                                  {isCorrectOpt && " ✓"}
                                  {isUserAnswer && !isCorrectOpt && " ✗"}
                                </p>
                              );
                            })}
                        </div>
                      )}

                      {q.type === "true_false" && (
                        <div className="mt-2 space-y-1">
                          {["True", "False"].map((opt) => {
                            const isCorrectOpt =
                              opt.toLowerCase() ===
                              q.correctAnswer.trim().toLowerCase();
                            const isUserAnswer =
                              q.userAnswer?.trim().toLowerCase() ===
                              opt.toLowerCase();
                            return (
                              <p
                                key={opt}
                                className={cn(
                                  "ml-4 text-sm",
                                  isCorrectOpt
                                    ? "font-medium text-primary"
                                    : isUserAnswer && !isCorrectOpt
                                      ? "text-destructive line-through"
                                      : "text-muted-foreground"
                                )}
                              >
                                {opt}
                                {isCorrectOpt && " ✓"}
                                {isUserAnswer && !isCorrectOpt && " ✗"}
                              </p>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "short_answer" && (
                        <div className="mt-2 ml-4 space-y-1">
                          <p
                            className={cn(
                              "text-sm",
                              q.userAnswer
                                ? q.userAnswer.trim().toLowerCase() ===
                                  q.correctAnswer.trim().toLowerCase()
                                  ? "text-primary"
                                  : "text-destructive"
                                : "text-muted-foreground"
                            )}
                          >
                            Your answer: {q.userAnswer || "(not answered)"}
                          </p>
                          {q.userAnswer?.trim().toLowerCase() !==
                            q.correctAnswer.trim().toLowerCase() && (
                            <p className="text-sm text-primary">
                              Correct answer: {q.correctAnswer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={q.isCorrect ? "default" : "secondary"}
                      className={
                        q.isCorrect
                          ? "bg-primary/20 text-primary"
                          : q.userAnswer
                            ? "bg-destructive/20 text-destructive"
                            : ""
                      }
                    >
                      {q.isCorrect
                        ? `+${q.points}`
                        : q.userAnswer
                          ? "0"
                          : "-"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="mb-4 text-lg font-semibold">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-medium text-primary">
                  {
                    questionsWithAnswers.filter((q) => q.isCorrect === true)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Incorrect</span>
                <span className="font-medium text-destructive">
                  {
                    questionsWithAnswers.filter(
                      (q) => q.isCorrect === false
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unanswered</span>
                <span className="font-medium text-muted-foreground">
                  {
                    questionsWithAnswers.filter((q) => q.isCorrect === null)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points</span>
                <span className="font-medium">
                  {attempt.score}/{attempt.totalPoints}
                </span>
              </div>
            </div>
          </GlassCard>

          <Link href={`/tests/${id}`} className="block">
            <Button
              variant="outline"
              className="w-full rounded-xl"
            >
              View Test Details
            </Button>
          </Link>
          <Link href="/tests" className="block">
            <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)]">
              Browse More Tests
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
