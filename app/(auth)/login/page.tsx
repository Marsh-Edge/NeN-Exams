"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, type LoginInput } from "../actions";
import { GlassCard } from "@/components/glass-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

function safeRedirect(path: string | null): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    const input: LoginInput = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const result = await login(input);

    if (!result.success) {
      const errors = result.error as Record<string, string[]>;
      const firstError = Object.values(errors).flat()[0];
      setError(firstError);
      setLoading(false);
    } else {
      router.push(safeRedirect(redirect));
      router.refresh();
    }
  }

  return (
    <>
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <GlassCard className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-aurora text-xl font-bold text-white shadow-aurora">
            N
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to NeN Exams
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              className="rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-aurora-btn text-white font-semibold shadow-aurora transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,170,0.4)]"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create one
          </Link>
        </div>
      </GlassCard>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
