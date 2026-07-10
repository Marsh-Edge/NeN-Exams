"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/(auth)/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

interface HeaderProps {
  user: {
    displayName: string;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-glass-border px-4 py-3">
      <div className="flex items-center gap-3 lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="size-9" />
            }
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar user={user} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.7_0.12_190)] text-xs font-bold text-primary-foreground">
          N
        </div>
        <span className="font-semibold">
          <span className="neon-text">NeN</span>
        </span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="rounded-xl text-muted-foreground"
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
