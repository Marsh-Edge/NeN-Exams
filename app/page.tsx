"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleSelector } from "@/components/role-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string>();
  const router = useRouter();

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/register?role=${selectedRole}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="neon-text">NeN</span>{" "}
          <span className="text-foreground">Exams</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Choose your role to get started
        </p>
      </div>

      <GlassCard className="w-full max-w-2xl">
        <RoleSelector
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_20px_var(--neon-glow)] transition-all duration-300 hover:shadow-[0_0_30px_var(--neon-glow)] disabled:opacity-50 disabled:shadow-none"
            size="lg"
          >
            Continue as {selectedRole || "..."}
          </Button>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            className="flex-1 rounded-xl"
            size="lg"
          >
            I already have an account
          </Button>
        </div>
      </GlassCard>

      <p className="mt-6 text-sm text-muted-foreground">
        Select a role above, then register or login to continue
      </p>
    </div>
  );
}
