"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  updateProfile,
  changePassword,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "./actions";

interface ProfilePageProps {
  session: {
    user: {
      id: string;
      username: string;
      email: string;
      displayName: string;
      role: string;
      avatarUrl: string | null;
    };
  };
}

const roleDescriptions: Record<string, string> = {
  student: "Take tests, view results, and track your progress",
  teacher: "Create and manage tests, view student results",
  organizer: "Organize and schedule tests, manage test events",
  viewer: "View test results, analytics, and reports",
};

export function ProfileClient({ session }: ProfilePageProps) {
  const user = session.user;
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>(
    {}
  );
  const [passwordErrors, setPasswordErrors] = useState<
    Record<string, string[]>
  >({});

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileErrors({});
    setProfileSuccess(false);

    const formData = new FormData(e.currentTarget);
    const input: UpdateProfileInput = {
      displayName: formData.get("displayName") as string,
      email: formData.get("email") as string,
    };

    const result = await updateProfile(input);

    if (!result.success) {
      setProfileErrors(result.error as Record<string, string[]>);
    } else {
      setProfileSuccess(true);
    }
    setProfileLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    const formData = new FormData(e.currentTarget);
    const input: ChangePasswordInput = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = await changePassword(input);

    if (!result.success) {
      setPasswordErrors(result.error as Record<string, string[]>);
    } else {
      setPasswordSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setPasswordLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.12_190)] text-3xl font-bold text-primary-foreground">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-xl font-semibold">{user.displayName}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
            <Badge variant="secondary" className="mt-2 capitalize">
              {user.role}
            </Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              {roleDescriptions[user.role] || ""}
            </p>
          </div>
        </GlassCard>

        <div className="space-y-6 lg:col-span-2">
          <GlassCard>
            <h3 className="mb-4 text-lg font-semibold">Edit Profile</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileErrors._form && (
                <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {profileErrors._form[0]}
                </div>
              )}
              {profileSuccess && (
                <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                  Profile updated successfully.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={user.displayName}
                  required
                  className="rounded-xl"
                />
                {profileErrors.displayName && (
                  <p className="text-xs text-destructive">
                    {profileErrors.displayName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="rounded-xl"
                />
                {profileErrors.email && (
                  <p className="text-xs text-destructive">
                    {profileErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={user.username}
                  disabled
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>

              <Button
                type="submit"
                disabled={profileLoading}
                className="rounded-xl"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 text-lg font-semibold">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordErrors._form && (
                <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {passwordErrors._form[0]}
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                  Password changed successfully.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="rounded-xl"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.currentPassword[0]}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="rounded-xl"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.newPassword[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="rounded-xl"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.confirmPassword[0]}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={passwordLoading}
                variant="outline"
                className="rounded-xl"
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
