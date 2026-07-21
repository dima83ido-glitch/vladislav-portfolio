"use server";

import { redirect } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users, verificationCodes } from "@/db/schema";
import { sendVerificationCodeEmail } from "@/lib/email/resend";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isAdminEmail } from "./admin";
import {
  OTP_MAX_ATTEMPTS,
  OTP_REQUEST_LIMIT,
  OTP_REQUEST_WINDOW_MS,
  OTP_TTL_MS,
  generateOtpCode,
  hashOtpCode,
} from "./otp";
import { PASSWORD_MIN_LENGTH, hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, requireUser } from "./session";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH).max(100);

export type ActionResult<TError extends string> =
  | { ok: true }
  | { ok: false; error: TError };

/** The only place allowed to select passwordHash — never returned outward. */
async function getAuthRecordByEmail(email: string) {
  const [row] = await getDb()
    .select({ id: users.id, status: users.status, role: users.role, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return row ?? null;
}

async function consumeOtp(
  email: string,
  code: string,
  purpose: "login" | "register" | "password_reset"
): Promise<ActionResult<"invalidCode" | "expiredCode" | "tooManyAttempts">> {
  const db = getDb();

  const [latest] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.purpose, purpose),
        isNull(verificationCodes.consumedAt)
      )
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);

  if (!latest) return { ok: false, error: "invalidCode" };
  if (latest.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, error: "tooManyAttempts" };
  if (latest.expiresAt.getTime() < Date.now()) return { ok: false, error: "expiredCode" };

  if (hashOtpCode(code) !== latest.codeHash) {
    await db
      .update(verificationCodes)
      .set({ attempts: latest.attempts + 1 })
      .where(eq(verificationCodes.id, latest.id));
    return { ok: false, error: "invalidCode" };
  }

  await db.update(verificationCodes).set({ consumedAt: new Date() }).where(eq(verificationCodes.id, latest.id));
  return { ok: true };
}

async function sendOtp(email: string, purpose: "login" | "register" | "password_reset") {
  const code = generateOtpCode();
  const codeHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await getDb().insert(verificationCodes).values({ email, codeHash, expiresAt, purpose });
  await sendVerificationCodeEmail(email, code);
}

// ============================== Register ==============================

export async function registerRequestCode(
  rawEmail: string,
  password: string,
  confirmPassword: string
): Promise<ActionResult<"invalidEmail" | "invalidPassword" | "passwordMismatch" | "emailInUse" | "rateLimited" | "sendFailed">> {
  const parsedEmail = emailSchema.safeParse(rawEmail);
  if (!parsedEmail.success) return { ok: false, error: "invalidEmail" };
  if (!passwordSchema.safeParse(password).success) return { ok: false, error: "invalidPassword" };
  if (password !== confirmPassword) return { ok: false, error: "passwordMismatch" };

  const email = parsedEmail.data;
  const existing = await getAuthRecordByEmail(email);
  if (existing) return { ok: false, error: "emailInUse" };

  const { limited } = await checkRateLimit(`register:${email}`, OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW_MS);
  if (limited) return { ok: false, error: "rateLimited" };

  try {
    await sendOtp(email, "register");
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { ok: false, error: "sendFailed" };
  }

  return { ok: true };
}

export async function registerVerifyCode(
  rawEmail: string,
  rawCode: string,
  password: string,
  rememberMe = false
): Promise<ActionResult<"invalidCode" | "expiredCode" | "tooManyAttempts" | "invalidPassword" | "emailInUse" | "generic">> {
  const parsedEmail = emailSchema.safeParse(rawEmail);
  const code = rawCode.trim();
  if (!parsedEmail.success || code.length === 0) return { ok: false, error: "invalidCode" };
  if (!passwordSchema.safeParse(password).success) return { ok: false, error: "invalidPassword" };

  const email = parsedEmail.data;
  const otpResult = await consumeOtp(email, code, "register");
  if (!otpResult.ok) return otpResult;

  const existing = await getAuthRecordByEmail(email);
  if (existing) return { ok: false, error: "emailInUse" };

  try {
    const passwordHash = await hashPassword(password);
    const shouldBeAdmin = isAdminEmail(email);
    const [user] = await getDb()
      .insert(users)
      .values({
        email,
        passwordHash,
        role: shouldBeAdmin ? "admin" : "customer",
        lastLoginAt: new Date(),
      })
      .returning({ id: users.id });

    await createSession(user.id, rememberMe);
    return { ok: true };
  } catch (error) {
    console.error("Failed to create account:", error);
    return { ok: false, error: "generic" };
  }
}

// ================================ Login ================================

export async function loginRequestCode(
  rawEmail: string,
  password: string
): Promise<ActionResult<"invalidCredentials" | "accountBlocked" | "rateLimited" | "sendFailed">> {
  const parsedEmail = emailSchema.safeParse(rawEmail);
  if (!parsedEmail.success || password.length === 0) return { ok: false, error: "invalidCredentials" };

  const email = parsedEmail.data;
  const record = await getAuthRecordByEmail(email);
  if (!record) return { ok: false, error: "invalidCredentials" };

  if (record.status !== "active") return { ok: false, error: "accountBlocked" };

  // Legacy accounts created before password-backed auth shipped have no
  // hash yet — this password gets adopted (hashed + stored) once the OTP
  // step succeeds. OTP (proof of email access) remains the real gate here,
  // so accepting any password at this stage doesn't grant anything by
  // itself.
  if (record.passwordHash) {
    const valid = await verifyPassword(password, record.passwordHash);
    if (!valid) return { ok: false, error: "invalidCredentials" };
  }

  const { limited } = await checkRateLimit(`login:${email}`, OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW_MS);
  if (limited) return { ok: false, error: "rateLimited" };

  try {
    await sendOtp(email, "login");
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { ok: false, error: "sendFailed" };
  }

  return { ok: true };
}

export async function loginVerifyCode(
  rawEmail: string,
  rawCode: string,
  password: string,
  rememberMe = false
): Promise<ActionResult<"invalidCode" | "expiredCode" | "tooManyAttempts" | "accountBlocked" | "generic">> {
  const parsedEmail = emailSchema.safeParse(rawEmail);
  const code = rawCode.trim();
  if (!parsedEmail.success || code.length === 0) return { ok: false, error: "invalidCode" };

  const email = parsedEmail.data;
  const otpResult = await consumeOtp(email, code, "login");
  if (!otpResult.ok) return otpResult;

  const record = await getAuthRecordByEmail(email);
  if (!record) return { ok: false, error: "generic" };
  if (record.status !== "active") return { ok: false, error: "accountBlocked" };

  try {
    if (!record.passwordHash) {
      // Completes the legacy-account claim started in loginRequestCode.
      const passwordHash = await hashPassword(password);
      await getDb().update(users).set({ passwordHash }).where(eq(users.id, record.id));
    }

    await getDb().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, record.id));
    await createSession(record.id, rememberMe);
    return { ok: true };
  } catch (error) {
    console.error("Failed to complete login:", error);
    return { ok: false, error: "generic" };
  }
}

// ============================= Password mgmt =============================

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult<"invalidPassword" | "passwordMismatch" | "incorrectPassword" | "noPasswordSet" | "generic">> {
  const session = await requireUser().catch(() => null);
  if (!session) return { ok: false, error: "generic" };

  if (!passwordSchema.safeParse(newPassword).success) return { ok: false, error: "invalidPassword" };
  if (newPassword !== confirmPassword) return { ok: false, error: "passwordMismatch" };

  const record = await getAuthRecordByEmail(session.user.email);
  if (!record) return { ok: false, error: "generic" };
  if (!record.passwordHash) return { ok: false, error: "noPasswordSet" };

  const valid = await verifyPassword(currentPassword, record.passwordHash);
  if (!valid) return { ok: false, error: "incorrectPassword" };

  try {
    const passwordHash = await hashPassword(newPassword);
    await getDb().update(users).set({ passwordHash }).where(eq(users.id, session.user.id));
    return { ok: true };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { ok: false, error: "generic" };
  }
}

export async function requestPasswordReset(): Promise<ActionResult<"rateLimited" | "sendFailed" | "generic">> {
  const session = await requireUser().catch(() => null);
  if (!session) return { ok: false, error: "generic" };

  const { limited } = await checkRateLimit(
    `password-reset:${session.user.email}`,
    OTP_REQUEST_LIMIT,
    OTP_REQUEST_WINDOW_MS
  );
  if (limited) return { ok: false, error: "rateLimited" };

  try {
    await sendOtp(session.user.email, "password_reset");
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { ok: false, error: "sendFailed" };
  }

  return { ok: true };
}

export async function resetPassword(
  rawCode: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult<"invalidCode" | "expiredCode" | "tooManyAttempts" | "invalidPassword" | "passwordMismatch" | "generic">> {
  const session = await requireUser().catch(() => null);
  if (!session) return { ok: false, error: "generic" };

  const code = rawCode.trim();
  if (code.length === 0) return { ok: false, error: "invalidCode" };
  if (!passwordSchema.safeParse(newPassword).success) return { ok: false, error: "invalidPassword" };
  if (newPassword !== confirmPassword) return { ok: false, error: "passwordMismatch" };

  const otpResult = await consumeOtp(session.user.email, code, "password_reset");
  if (!otpResult.ok) return otpResult;

  try {
    const passwordHash = await hashPassword(newPassword);
    await getDb().update(users).set({ passwordHash }).where(eq(users.id, session.user.id));
    return { ok: true };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return { ok: false, error: "generic" };
  }
}

// ================================ Logout ================================

export async function logout() {
  await destroySession();
}

export async function logoutAndRedirect() {
  await destroySession();
  redirect("/login");
}
