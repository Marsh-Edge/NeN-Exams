"use client";

import { useState } from "react";
import { publishTest, unpublishTest } from "../create/actions";
import { Button } from "@/components/ui/button";

interface PublishToggleProps {
  testId: string;
  isPublished: boolean;
}

export function PublishToggle({ testId, isPublished }: PublishToggleProps) {
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);
  const [error, setError] = useState<string>();

  async function toggle() {
    setLoading(true);
    setError(undefined);
    const result = published
      ? await unpublishTest(testId)
      : await publishTest(testId);

    if (result.success) {
      setPublished(!published);
    } else {
      const err = result.error as { _form?: string[] } | string;
      setError(
        typeof err === "string" ? err : err._form?.[0] || "Action failed"
      );
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        disabled={loading}
        className="rounded-xl"
      >
        {loading ? "..." : published ? "Unpublish" : "Publish"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
