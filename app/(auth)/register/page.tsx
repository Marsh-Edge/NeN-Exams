"use client";

import { Suspense, useState } from "react";
import { register, type RegisterInput } from "../actions";
import { GlassCard } from "@/components/glass-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const roleLabels: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  organizer: "Test Organizer",
  viewer: "Test Viewer",
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "student";
  const [errors, setErrors] = useState<Record<string, string[]>>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors(undefined);

    const formData = new FormData(e.currentTarget);
    const input: RegisterInput = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      displayName: formData.get("displayName") as string,
      role: formData.get("role") as RegisterInput["role"],
    };

    const result = await register(input);

    if (!result.success) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <GlassCard className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">
            <span className="neon-text">NeN</span> Exams
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your account as a{" "}
            <span className="font-medium text-primary">
              {roleLabels[initialRole] || "Student"}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="role" value={initialRole} />

          {errors && Object.keys(errors).length > 0 && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {Object.values(errors)
                .flat()
                .map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="John Doe"
              required
              className="rounded-xl"
            />
            {errors?.displayName && (
              <p className="text-xs text-destructive">
                {errors.displayName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              required
              className="rounded-xl"
            />
            {errors?.username && (
              <p className="text-xs text-destructive">{errors.username[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="rounded-xl"
            />
            {errors?.email && (
              <p className="text-xs text-destructive">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
              required
              className="rounded-xl"
            />
            {errors?.password && (
              <p className="text-xs text-destructive">{errors.password[0]}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-[oklch(0.7_0.12_190)] text-primary-foreground shadow-[0_0_15px_var(--neon-glow)] transition-all duration-300 hover:shadow-[0_0_25px_var(--neon-glow)]"
            size="lg"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
