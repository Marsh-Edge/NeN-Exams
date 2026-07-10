"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment, type AddCommentInput } from "./actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddCommentFormProps {
  publishedTests: { id: string; title: string }[];
}

export function AddCommentForm({ publishedTests }: AddCommentFormProps) {
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
    const input: AddCommentInput = {
      testId: formData.get("testId") as string,
      content: formData.get("content") as string,
    };

    const result = await addComment(input);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors._form && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors._form[0]}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
          Comment added.
        </div>
      )}

      <div className="space-y-2">
        <Select name="testId">
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a test to comment on" />
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

      <textarea
        name="content"
        placeholder="Write your comment..."
        required
        rows={3}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {errors.content && (
        <p className="text-xs text-destructive">{errors.content[0]}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="rounded-xl"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            Posting...
          </span>
        ) : (
          "Post Comment"
        )}
      </Button>
    </form>
  );
}
