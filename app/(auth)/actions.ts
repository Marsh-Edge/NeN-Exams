"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  displayName: z.string().min(1, "Display name is required").max(50),
  role: z.enum(["student", "teacher", "organizer", "viewer"]),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export async function register(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { username, email, password, displayName, role } = parsed.data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser[0]) {
    return { success: false, error: { email: ["Email already in use"] } };
  }

  const existingUsername = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUsername[0]) {
    return { success: false, error: { username: ["Username already taken"] } };
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    id,
    username,
    email,
    passwordHash,
    displayName,
    role,
  });

  await createSession(id);
  redirect("/dashboard");
}

export async function login(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user[0]) {
    return { success: false, error: { email: ["Invalid email or password"] } };
  }

  const isValid = await verifyPassword(password, user[0].passwordHash);
  if (!isValid) {
    return { success: false, error: { email: ["Invalid email or password"] } };
  }

  await createSession(user[0].id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
