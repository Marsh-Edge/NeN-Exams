"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSchedule } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteScheduleButtonProps {
  scheduleId: string;
}

export function DeleteScheduleButton({
  scheduleId,
}: DeleteScheduleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Remove this schedule?")) return;

    setLoading(true);
    setError(undefined);
    const result = await deleteSchedule(scheduleId);

    if (result.success) {
      router.refresh();
    } else {
      const err = result.error as { _form?: string[] } | string;
      setError(
        typeof err === "string" ? err : err._form?.[0] || "Failed to remove"
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
        {loading ? "..." : "Remove"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
