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
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;

    setLoading(true);
    const result = await deleteComment(commentId);
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
      className="rounded-xl text-xs text-destructive hover:text-destructive"
    >
      {loading ? <Spinner size="sm" /> : "Delete"}
    </Button>
  );
}
