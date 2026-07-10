import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  neon?: boolean;
}

export function GlassCard({ children, className, neon }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        neon && "neon-glow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
