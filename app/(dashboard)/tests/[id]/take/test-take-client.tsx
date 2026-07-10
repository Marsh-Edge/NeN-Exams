"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, finishTest } from "../actions";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string | null;
  orderIndex: number;
  points: number;
}

interface TestTakeClientProps {
  attemptId: string;
  testId: string;
  testTitle: string;
  timeLimitMinutes: number;
  startedAt: string;
  questions: Question[];
}

export function TestTakeClient({
  attemptId,
  testId,
  testTitle,
  timeLimitMinutes,
  startedAt,
  questions,
}: TestTakeClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingMs, setRemainingMs] = useState(() => {
    const elapsed = Date.now() - new Date(startedAt).getTime();
    const limit = timeLimitMinutes * 60 * 1000;
    return Math.max(0, limit - elapsed);
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const lastBlurTime = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const finishRef = useRef(false);

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k].trim() !== ""
  ).length;

  const doFinish = useCallback(async () => {
    if (finishRef.current) return;
    finishRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer.trim() !== "") {
        await submitAnswer(attemptId, questionId, answer);
      }
    }

    const result = await finishTest(attemptId);
    if (result.success) {
      router.push(`/tests/${testId}/results?attemptId=${attemptId}`);
    }
  }, [answers, attemptId, testId, router]);

  useEffect(() => {
    function computeRemaining() {
      const elapsed = Date.now() - new Date(startedAt).getTime();
      const limit = timeLimitMinutes * 60 * 1000;
      return Math.max(0, limit - elapsed);
    }

    timerRef.current = setInterval(() => {
      const rem = computeRemaining();
      setRemainingMs(rem);
      if (rem <= 0) {
        doFinish();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startedAt, timeLimitMinutes, doFinish]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        const now = Date.now();
        if (now - lastBlurTime.current > 2000) {
          lastBlurTime.current = now;
          setTabSwitchCount((prev) => prev + 1);
          setShowTabWarning(true);
          setTimeout(() => setShowTabWarning(false), 3000);
        }
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const debouncedSave = useCallback(
    (questionId: string, answer: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        submitAnswer(attemptId, questionId, answer);
      }, 500);
    },
    [attemptId]
  );

  function updateAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    debouncedSave(questionId, value);
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  const question = questions[currentIndex];
  const options =
    question.type === "multiple_choice" && question.options
      ? question.options
          .split("\n")
          .filter((o) => o.trim())
          .map((o) => o.trim())
      : question.type === "true_false"
        ? ["True", "False"]
        : [];

  const progressPercent = Math.round(
    (answeredCount / questions.length) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {showTabWarning && (
        <div className="fixed inset-x-0 top-0 z-[60] animate-pulse bg-destructive/90 px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
          Warning: Tab switch detected! ({tabSwitchCount} time
          {tabSwitchCount !== 1 ? "s" : ""})
        </div>
      )}

      <header className="glass flex items-center justify-between border-b border-glass-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold sm:text-base">
            {testTitle}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={cn(
                "font-mono text-lg font-bold",
                remainingMs < 60000
                  ? "text-destructive"
                  : remainingMs < 300000
                    ? "text-yellow-500"
                    : "text-primary"
              )}
            >
              {formatTime(remainingMs)}
            </p>
            <p className="text-xs text-muted-foreground">remaining</p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Badge variant="secondary" className="rounded-xl">
              Question {currentIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className="rounded-xl">
              {question.points} {question.points === 1 ? "point" : "points"}
            </Badge>
          </div>

          <GlassCard className="flex-1">
            <p className="mb-6 text-lg font-medium">{question.text}</p>

            {question.type === "short_answer" ? (
              <input
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoFocus
              />
            ) : (
              <div className="space-y-3">
                {options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected =
                    (answers[question.id] || "").trim().toLowerCase() ===
                    opt.toLowerCase();
                  return (
                    <button
                      key={i}
                      onClick={() => updateAnswer(question.id, opt)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary neon-glow-sm"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {letter}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </GlassCard>

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            >
              Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button
                className="rounded-xl"
                onClick={() =>
                  setCurrentIndex((i) =>
                    Math.min(questions.length - 1, i + 1)
                  )
                }
              >
                Next
              </Button>
            ) : (
              <Button
                className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground"
                onClick={() => setShowConfirm(true)}
              >
                Finish Test
              </Button>
            )}
          </div>
        </div>

        <div className="hidden w-64 border-l border-glass-border p-4 lg:block">
          <h3 className="mb-3 text-sm font-semibold">Question Navigator</h3>
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>
                {answeredCount}/{questions.length} answered
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg text-xs font-medium transition-all",
                  i === currentIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : answers[q.id] && answers[q.id].trim() !== ""
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="mx-4 w-full max-w-md">
            <h3 className="text-lg font-semibold">Submit Test?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You have answered{" "}
              <span className="font-medium text-primary">
                {answeredCount}
              </span>{" "}
              of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="mt-1 block text-yellow-500">
                  {questions.length - answeredCount} question
                  {questions.length - answeredCount !== 1 ? "s" : ""}{" "}
                  unanswered.
                </span>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowConfirm(false)}
              >
                Go Back
              </Button>
              <Button
                className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground"
                onClick={() => doFinish()}
              >
                Submit
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
