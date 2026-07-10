import { GlassCard } from "@/components/glass-card";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">
          View your test history and past activities
        </p>
      </div>
      <GlassCard>
        <p className="text-muted-foreground">
          Test history will be implemented in the next step.
        </p>
      </GlassCard>
    </div>
  );
}
