"use server";

import { redirect } from "next/navigation";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users, verificationCodes } from "@/db/schema";
import { sendVerificationCodeEmail } from "@/lib/email/resend";
import { isAdminEmail } from "./admin";
import {
  OTP_MAX_ATTEMPTS,
  OTP_REQUEST_LIMIT,
  OTP_REQUEST_WINDOW_MS,
  OTP_TTL_MS,
  generateOtpCode,
  hashOtpCode,
} from "./otp";
import { createSession, destroySession } from "./session";

const emailSchema = z.string().trim().toLowerCase().email();

export type ActionResult<TError extends string> =
  | { ok: true }
  | { ok: false; error: TError };

export async function requestCode(
  rawEmail: string
): Promise<ActionResult<"invalidEmail" | "rateLimited" | "sendFailed">> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return { ok: false, error: "invalidEmail" };
  }
  const email = parsed.data;
  const db = getDb();

  const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MS);
  const recent = await db
    .select({ id: verificationCodes.id })
    .from(verificationCodes)
    .where(
      and(eq(verificationCodes.email, email), gt(verificationCodes.createdAt, windowStart))
    );

  if (recent.length >= OTP_REQUEST_LIMIT) {
    return { ok: false, error: "rateLimited" };
  }

  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.insert(verificationCodes).values({
    email,
    codeHash,
    expiresAt,
    purpose: "login",
  });

  try {
    await sendVerificationCodeEmail(email, code);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { ok: false, error: "sendFailed" };
  }

  return { ok: true };
}

export async function verifyCode(
  rawEmail: string,
  rawCode: string
): Promise<ActionResult<"invalidCode" | "expiredCode" | "tooManyAttempts">> {
  const parsed = emailSchema.safeParse(rawEmail);
  const code = rawCode.trim();

  if (!parsed.success || code.length === 0) {
    return { ok: false, error: "invalidCode" };
  }

  const email = parsed.data;
  const db = getDb();

  const [latest] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.purpose, "login"),
        isNull(verificationCodes.consumedAt)
      )
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);

  if (!latest) {
    return { ok: false, error: "invalidCode" };
  }

  if (latest.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, error: "tooManyAttempts" };
  }

  if (latest.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "expiredCode" };
  }

  if (hashOtpCode(code) !== latest.codeHash) {
    await db
      .update(verificationCodes)
      .set({ attempts: latest.attempts + 1 })
      .where(eq(verificationCodes.id, latest.id));
    return { ok: false, error: "invalidCode" };
  }

  await db
    .update(verificationCodes)
    .set({ consumedAt: new Date() })
    .where(eq(verificationCodes.id, latest.id));

  const shouldBeAdmin = isAdminEmail(email);
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!existingUser) {
    await db.insert(users).values({
      email,
      role: shouldBeAdmin ? "admin" : "customer",
      lastLoginAt: new Date(),
    });
  } else {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        ...(shouldBeAdmin && existingUser.role !== "admin" ? { role: "admin" as const } : {}),
      })
      .where(eq(users.id, existingUser.id));
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { ok: false, error: "invalidCode" };
  }

  await createSession(user.id);

  return { ok: true };
}

export async function logout() {
  await destroySession();
}

export async function logoutAndRedirect() {
  await destroySession();
  redirect("/login");
}
