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

  async function toggle() {
    setLoading(true);
    const result = published
      ? await unpublishTest(testId)
      : await publishTest(testId);

    if (result.success) {
      setPublished(!published);
    }
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="rounded-xl"
    >
      {loading ? "..." : published ? "Unpublish" : "Publish"}
    </Button>
  );
}
