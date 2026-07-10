"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTest, type CreateTestInput } from "./actions";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuestionDraft {
  id: string;
  text: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options: string;
  correctAnswer: string;
  points: number;
}

function createEmptyQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    type: "multiple_choice",
    options: "",
    correctAnswer: "",
    points: 1,
  };
}

export function CreateTestClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    createEmptyQuestion(),
  ]);

  function addQuestion() {
    setQuestions([...questions, createEmptyQuestion()]);
  }

  function removeQuestion(id: string) {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  }

  function updateQuestion(
    id: string,
    field: keyof QuestionDraft,
    value: string | number
  ) {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const input: CreateTestInput = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      timeLimitMinutes: Number(formData.get("timeLimitMinutes")) || 30,
      questions: questions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.type === "multiple_choice" ? q.options : undefined,
        correctAnswer: q.correctAnswer,
        points: q.points,
      })),
    };

    const result = await createTest(input);

    if (!result.success) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
    } else {
      router.push("/tests/my");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Test</h1>
        <p className="text-muted-foreground">
          Design a new test with questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors._form && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errors._form[0]}
          </div>
        )}

        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold">Test Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Mathematics Final Exam"
                required
                className="rounded-xl"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Brief description of the test..."
                required
                rows={3}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimitMinutes">
                Time Limit (minutes)
              </Label>
              <Input
                id="timeLimitMinutes"
                name="timeLimitMinutes"
                type="number"
                min={1}
                max={180}
                defaultValue={30}
                className="rounded-xl w-32"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Questions ({questions.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="rounded-xl"
            >
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.id)}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Input
                      value={q.text}
                      onChange={(e) =>
                        updateQuestion(q.id, "text", e.target.value)
                      }
                      placeholder="Enter your question..."
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={q.type}
                        onValueChange={(value) => {
                          if (value) updateQuestion(q.id, "type", value);
                        }}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="true_false">
                            True / False
                          </SelectItem>
                          <SelectItem value="short_answer">
                            Short Answer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min={1}
                        value={q.points}
                        onChange={(e) =>
                          updateQuestion(
                            q.id,
                            "points",
                            Number(e.target.value)
                          )
                        }
                        className="rounded-xl w-24"
                      />
                    </div>
                  </div>

                  {q.type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>
                        Options (one per line)
                      </Label>
                      <textarea
                        value={q.options}
                        onChange={(e) =>
                          updateQuestion(q.id, "options", e.target.value)
                        }
                        placeholder={"Option A\nOption B\nOption C\nOption D"}
                        rows={4}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input
                      value={q.correctAnswer}
                      onChange={(e) =>
                        updateQuestion(q.id, "correctAnswer", e.target.value)
                      }
                      placeholder={
                        q.type === "true_false"
                          ? "true or false"
                          : q.type === "multiple_choice"
                            ? "Correct option text"
                            : "Expected answer"
                      }
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Creating...
              </span>
            ) : (
              "Create Test"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
