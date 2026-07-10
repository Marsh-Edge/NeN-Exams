import { GlassCard } from "@/components/glass-card";

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          View and manage test comments
        </p>
      </div>
      <GlassCard>
        <p className="text-muted-foreground">
          Comments section will be implemented in the next step.
        </p>
      </GlassCard>
    </div>
  );
}
