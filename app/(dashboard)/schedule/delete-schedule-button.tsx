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
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Remove this schedule?")) return;

    setLoading(true);
    const result = await deleteSchedule(scheduleId);

    if (result.success) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl text-destructive hover:text-destructive"
    >
      {loading ? "..." : "Remove"}
    </Button>
  );
}
