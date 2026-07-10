"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Schedule {
  id: string;
  scheduledAt: string;
  location: string | null;
  testId: string;
  testTitle: string;
  testDescription?: string;
  organizerName: string;
  organizerUsername?: string;
}

function getTimeStatus(diffMs: number) {
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes > 0) return `${minutes} min`;
  return "Starting soon";
}

export function UpcomingList({
  schedules,
  showDescription,
  serverTimeMs,
}: {
  schedules: Schedule[];
  showDescription?: boolean;
  serverTimeMs: number;
}) {
  const [nowMs, setNowMs] = useState(serverTimeMs);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const items = useMemo(
    () =>
      schedules.map((s) => {
        const diff = new Date(s.scheduledAt).getTime() - nowMs;
        return { ...s, diff };
      }),
    [schedules, nowMs]
  );

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No items to show.</p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((s) => {
        const isStartingSoon = s.diff < 60 * 60 * 1000;
        return (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/tests/${s.testId}`}
                  className="font-semibold hover:underline"
                >
                  {s.testTitle}
                </Link>
                {isStartingSoon && (
                  <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
                    Starting Soon
                  </Badge>
                )}
              </div>
              {showDescription && s.testDescription && (
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                  {s.testDescription}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Organized by {s.organizerName} &middot;{" "}
                {s.location || "Online"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">
                {new Date(s.scheduledAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(s.scheduledAt).toLocaleTimeString()}
              </p>
              <p
                className={`mt-1 text-xs font-medium ${
                  isStartingSoon ? "text-yellow-500" : "text-primary"
                }`}
              >
                in {getTimeStatus(s.diff)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WeekFilter({
  schedules,
  serverTimeMs,
}: {
  schedules: { scheduledAt: string }[];
  serverTimeMs: number;
}) {
  const count = useMemo(
    () =>
      schedules.filter(
        (s) =>
          new Date(s.scheduledAt).getTime() - serverTimeMs <
          7 * 24 * 60 * 60 * 1000
      ).length,
    [schedules, serverTimeMs]
  );

  return (
    <>
      <p className="text-sm text-muted-foreground">This Week</p>
      <p className="mt-1 text-3xl font-bold text-primary">{count}</p>
    </>
  );
}
