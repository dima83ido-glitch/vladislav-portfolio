import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await getDb().insert(sessions).values({ tokenHash, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Reads the current session, if any. This is called on every page render
 * (to decide what the header shows), so a missing/unreachable database
 * must degrade to "logged out" rather than crashing the whole site —
 * only explicit auth/admin actions should surface a hard DB error.
 */
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);

  try {
    const rows = await getDb()
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.tokenHash, tokenHash))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    if (row.session.expiresAt.getTime() < Date.now()) return null;

    return { user: row.user, sessionId: row.session.id };
  } catch (error) {
    console.error("Failed to read session:", error);
    return null;
  }
});

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  cookieStore.delete(SESSION_COOKIE);
}

/** Revokes every session belonging to a user (e.g. "sign out everywhere"). */
export async function destroyAllSessions(userId: string) {
  await getDb().delete(sessions).where(eq(sessions.userId, userId));
}

type SessionUser = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/**
 * For Server Actions: throws rather than redirecting, so the caller (a
 * client component expecting a normal return value) gets an inline error
 * instead of being yanked to a different page mid-interaction.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return session;
}

/**
 * For layouts/pages: a full navigation to /login is exactly the right UX
 * when a protected page is hit while logged out, so this redirects instead
 * of throwing.
 */
export async function requireUserOrRedirect(callbackUrl: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export async function requireAdminOrRedirect(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }
  return session;
}
