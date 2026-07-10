import { getSession } from "@/lib/auth/session";
import { GlassCard } from "@/components/glass-card";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.12_190)] text-2xl font-bold text-primary-foreground">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-accent/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="rounded-xl bg-accent/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium capitalize">{user.role}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
