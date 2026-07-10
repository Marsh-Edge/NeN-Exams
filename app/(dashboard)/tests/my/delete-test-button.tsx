"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTest } from "../create/actions";
import { Button } from "@/components/ui/button";

interface DeleteTestButtonProps {
  testId: string;
}

export function DeleteTestButton({ testId }: DeleteTestButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this test?")) return;

    setLoading(true);
    const result = await deleteTest(testId);

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
      {loading ? "..." : "Delete"}
    </Button>
  );
}
