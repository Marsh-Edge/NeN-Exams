import { GlassCard } from "@/components/glass-card";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-muted-foreground">
          View current and previous test results
        </p>
      </div>
      <GlassCard>
        <p className="text-muted-foreground">
          Results page will be implemented in the next step.
        </p>
      </GlassCard>
    </div>
  );
}
