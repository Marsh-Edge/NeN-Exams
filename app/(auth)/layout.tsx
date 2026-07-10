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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Aurora background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-aurora-1/15 blur-3xl animate-aurora-drift" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-aurora-3/15 blur-3xl animate-aurora-drift [animation-delay:-7s]" />
        <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-2/10 blur-3xl animate-aurora-drift [animation-delay:-14s]" />
      </div>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
