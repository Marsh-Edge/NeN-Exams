import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeN Exams - Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
