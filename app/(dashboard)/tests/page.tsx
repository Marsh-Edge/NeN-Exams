import { GlassCard } from "@/components/glass-card";

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tests</h1>
        <p className="text-muted-foreground">
          Browse and take available tests
        </p>
      </div>
      <GlassCard>
        <p className="text-muted-foreground">
          Test listing will be implemented in the next step.
        </p>
      </GlassCard>
    </div>
  );
}
