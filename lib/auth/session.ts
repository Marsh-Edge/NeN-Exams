import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { eq, ne } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE = "nen-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const now = new Date().toISOString();
  const session = await db
    .select({
      id: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .limit(1);

  if (!session[0] || session[0].expiresAt < now) {
    if (session[0]) {
      await db.delete(sessions).where(eq(sessions.id, token));
    }
    return null;
  }

  return session[0];
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyOtherSessions() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(ne(sessions.id, token));
  }
}

export type Role = "student" | "teacher" | "organizer" | "viewer" | "superuser";

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.user.role !== "superuser" && session.user.role !== role) {
    throw new Error("Forbidden");
  }
  return session;
}

export { SESSION_COOKIE };
