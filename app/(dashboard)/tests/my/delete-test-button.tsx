"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTest } from "../create/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface DeleteTestButtonProps {
  testId: string;
}

export function DeleteTestButton({ testId }: DeleteTestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this test?")) return;

    setLoading(true);
    setError(undefined);
    const result = await deleteTest(testId);

    if (result.success) {
      router.refresh();
    } else {
      const err = result.error as { _form?: string[] } | string;
      setError(
        typeof err === "string" ? err : err._form?.[0] || "Failed to delete test"
      );
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-xl text-destructive hover:text-destructive"
      >
        {loading ? <Spinner size="sm" /> : "Delete"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
