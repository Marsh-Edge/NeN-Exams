"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scheduleTest, type ScheduleTestInput } from "./actions";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleTestClientProps {
  publishedTests: { id: string; title: string }[];
}

export function ScheduleTestClient({
  publishedTests,
}: ScheduleTestClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const input: ScheduleTestInput = {
      testId: formData.get("testId") as string,
      scheduledAt: formData.get("scheduledAt") as string,
      location: (formData.get("location") as string) || undefined,
    };

    const result = await scheduleTest(input);

    if (!result.success) {
      setErrors(result.error as Record<string, string[]>);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <GlassCard>
      <h3 className="mb-4 text-lg font-semibold">Schedule a Test</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors._form && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errors._form[0]}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
            Test scheduled successfully.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Test</Label>
            <Select name="testId">
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select a test" />
              </SelectTrigger>
              <SelectContent>
                {publishedTests.map((test) => (
                  <SelectItem key={test.id} value={test.id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.testId && (
              <p className="text-xs text-destructive">{errors.testId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date & Time</Label>
            <Input
              id="scheduledAt"
              name="scheduledAt"
              type="datetime-local"
              required
              className="rounded-xl"
            />
            {errors.scheduledAt && (
              <p className="text-xs text-destructive">
                {errors.scheduledAt[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Room 101 or Online"
              className="rounded-xl"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)]"
        >
          {loading ? "Scheduling..." : "Schedule Test"}
        </Button>
      </form>
    </GlassCard>
  );
}
