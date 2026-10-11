"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComment } from "./actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface DeleteCommentButtonProps {
  commentId: string;
}

export function DeleteCommentButton({ commentId }: DeleteCommentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;

    setLoading(true);
    setError(undefined);
    const result = await deleteComment(commentId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to delete comment");
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
        className="rounded-xl text-xs text-destructive hover:text-destructive"
      >
        {loading ? <Spinner size="sm" /> : "Delete"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
