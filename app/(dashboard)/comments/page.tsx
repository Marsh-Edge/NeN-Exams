import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { comments, tests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GlassCard } from "@/components/glass-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { AddCommentForm } from "./add-comment-form";
import { DeleteCommentButton } from "./delete-comment-button";

export default async function CommentsPage() {
  const session = await getSession();
  if (!session) return null;

  const publishedTests = await db
    .select({ id: tests.id, title: tests.title })
    .from(tests)
    .where(eq(tests.isPublished, true))
    .orderBy(desc(tests.createdAt));

  const allComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      testId: comments.testId,
      testTitle: tests.title,
      userId: comments.userId,
      username: users.username,
      displayName: users.displayName,
    })
    .from(comments)
    .innerJoin(tests, eq(comments.testId, tests.id))
    .innerJoin(users, eq(comments.userId, users.id))
    .orderBy(desc(comments.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          Discuss and share feedback on tests
        </p>
      </div>

      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold">Add a Comment</h3>
        <AddCommentForm publishedTests={publishedTests} />
      </GlassCard>

      {allComments.length === 0 ? (
        <GlassCard>
          <p className="text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {allComments.map((c) => (
            <GlassCard key={c.id}>
              <div className="flex items-start gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/20 text-xs text-primary">
                    {c.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {c.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      @{c.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &middot;
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href={`/tests/${c.testId}`}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    {c.testTitle}
                  </Link>
                  <p className="mt-2 text-sm">{c.content}</p>
                </div>
                {c.userId === session.user.id && (
                  <DeleteCommentButton commentId={c.id} />
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
