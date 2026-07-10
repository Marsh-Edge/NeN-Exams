import { GlassCard } from "@/components/glass-card";

export default function UpcomingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upcoming Tests</h1>
        <p className="text-muted-foreground">
          View scheduled and upcoming tests
        </p>
      </div>
      <GlassCard>
        <p className="text-muted-foreground">
          Upcoming tests will be implemented in the next step.
        </p>
      </GlassCard>
    </div>
  );
}
