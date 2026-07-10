import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  neon?: boolean;
  aurora?: boolean;
  subtle?: boolean;
}

export function GlassCard({
  children,
  className,
  neon,
  aurora,
  subtle,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300 ease-out",
        subtle ? "glass-subtle" : "glass",
        neon && "neon-glow-sm",
        aurora && "border-gradient-aurora shadow-aurora",
        "hover:translate-y-[-2px] hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
