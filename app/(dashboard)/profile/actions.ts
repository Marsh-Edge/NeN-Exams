"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfile(input: UpdateProfileInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { displayName, email } = parsed.data;

  if (email !== session.user.email) {
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail[0] && existingEmail[0].id !== session.user.id) {
      return {
        success: false,
        error: { email: ["Email already in use"] },
      };
    }
  }

  await db
    .update(users)
    .set({
      displayName,
      email,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, session.user.id));

  return { success: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export async function changePassword(input: ChangePasswordInput) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: { _form: ["Unauthorized"] } };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0]) {
    return { success: false, error: { _form: ["User not found"] } };
  }

  const { verifyPassword, hashPassword } = await import("@/lib/auth/password");
  const isValid = await verifyPassword(currentPassword, user[0].passwordHash);

  if (!isValid) {
    return {
      success: false,
      error: { currentPassword: ["Current password is incorrect"] },
    };
  }

  const newHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
