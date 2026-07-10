"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleSelector } from "@/components/role-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Smart Test Creation",
    description:
      "Build tests with multiple question types — multiple choice, true/false, and short answer. Set time limits and customize point values.",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: "Anti-Cheat Protection",
    description:
      "Tab switch detection, clipboard blocking, right-click prevention, and server-side timer enforcement keep tests fair.",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Real-time Analytics",
    description:
      "Track performance with detailed analytics — scores, completion rates, question-level insights, and platform-wide statistics.",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "Schedule & Organize",
    description:
      "Plan test events with scheduled dates, locations, and automated reminders. Keep everyone on track.",
    icon: (
      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
];

const steps = [
  {
    step: "01",
    title: "Choose Your Role",
    description: "Pick the role that fits you — student, teacher, organizer, or viewer.",
  },
  {
    step: "02",
    title: "Create or Take Tests",
    description: "Teachers build tests, students take them. It's that simple.",
  },
  {
    step: "03",
    title: "Get Instant Results",
    description: "Scores are calculated immediately with detailed breakdowns.",
  },
  {
    step: "04",
    title: "Track Progress",
    description: "Monitor performance over time with analytics and history.",
  },
];

const roleCards = [
  {
    id: "student",
    title: "Students",
    description: "Take tests, track progress, and view your results in real-time.",
    icon: (
      <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
      </svg>
    ),
  },
  {
    id: "teacher",
    title: "Teachers",
    description: "Create tests, manage questions, and review student submissions.",
    icon: (
      <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75m-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75m-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
  {
    id: "organizer",
    title: "Organizers",
    description: "Schedule test events, manage locations, and coordinate testing sessions.",
    icon: (
      <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: "viewer",
    title: "Viewers",
    description: "Access analytics, view reports, and monitor platform performance.",
    icon: (
      <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string>();
  const router = useRouter();

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/register?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ──── Navbar ──── */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-glass-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-aurora text-sm font-bold text-white shadow-aurora">
              N
            </div>
            <span className="text-xl font-bold">
              <span className="text-gradient-aurora">NeN</span>{" "}
              <span className="text-foreground">Exams</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
              className="rounded-xl"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/register?role=student")}
              className="rounded-xl bg-gradient-aurora-btn text-white font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ──── Hero ──── */}
      <section className="relative overflow-hidden">
        {/* Aurora background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 -top-48 size-[600px] rounded-full bg-aurora-1/15 blur-[120px] animate-aurora-drift" />
          <div className="absolute -bottom-48 -right-48 size-[600px] rounded-full bg-aurora-3/15 blur-[120px] animate-aurora-drift [animation-delay:-7s]" />
          <div className="absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-2/10 blur-[100px] animate-aurora-drift [animation-delay:-14s]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-gradient-aurora text-3xl font-bold text-white shadow-aurora">
              N
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              The Modern{" "}
              <span className="text-gradient-aurora">Online Testing</span>{" "}
              Platform
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Create, manage, and take tests with built-in anti-cheat protection,
              real-time analytics, and a beautiful glass morphism interface.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/register?role=student")}
                className="rounded-xl bg-gradient-aurora-btn px-8 text-white font-semibold shadow-aurora transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,170,0.5)]"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="rounded-xl px-8"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Features ──── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A complete testing platform with tools for every role.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <GlassCard key={feature.title} className="group hover:shadow-aurora transition-all duration-300">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-aurora group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ──── How It Works ──── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Get started in four simple steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-aurora/10 text-xl font-bold text-gradient-aurora">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Roles ──── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Built for Everyone
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Choose the role that fits you and get started immediately.
            </p>
          </div>

          <div className="mt-16">
            <GlassCard className="mx-auto max-w-3xl">
              <RoleSelector
                selectedRole={selectedRole}
                onSelect={setSelectedRole}
              />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="flex-1 rounded-xl bg-gradient-aurora-btn text-white font-semibold shadow-aurora transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,170,0.4)] disabled:opacity-50 disabled:shadow-none"
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
          </div>
        </div>
      </section>

      {/* ──── Role Cards (visual) ──── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roleCards.map((role) => (
              <GlassCard
                key={role.id}
                className="group text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-aurora"
              >
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-aurora group-hover:text-white">
                  {role.icon}
                </div>
                <h3 className="text-lg font-semibold">{role.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {role.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <GlassCard aurora className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join NeN Exams today and experience the future of online testing.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/register?role=student")}
                className="rounded-xl bg-gradient-aurora-btn px-8 text-white font-semibold shadow-aurora transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,170,0.5)]"
              >
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/login")}
                className="rounded-xl px-8"
              >
                Sign In
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="border-t border-glass-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-aurora text-xs font-bold text-white">
              N
            </div>
            <span className="text-sm font-semibold">
              <span className="text-gradient-aurora">NeN</span> Exams
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Tailwind CSS, and Drizzle ORM.
          </p>
        </div>
      </footer>
    </div>
  );
}
