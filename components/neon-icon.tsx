"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface NeonIconProps {
  children: React.ReactNode;
  className?: string;
}

export function NeonIcon({ children, className }: NeonIconProps) {
  const { theme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return <div className={cn("size-12", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-xl",
        theme === "dark"
          ? "bg-neon/10 text-neon shadow-[0_0_12px_rgba(15,240,195,0.3)]"
          : "bg-primary/10 text-primary shadow-[0_0_12px_rgba(0,212,170,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}
