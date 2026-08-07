"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { destroyOtherSessions, requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { deleteMedia, isCloudinaryConfigured, uploadAvatarMedia } from "@/lib/media/cloudinary";
import { detectFileType } from "@/lib/media/validation";
import {
  ALLOWED_AVATAR_MIME,
  AVATAR_MAX_BYTES,
  isAllowedAvatarFileType,
  isBuiltinAvatar,
} from "./avatar";
import { updateProfileSchema } from "./validation";

const PROFILE_UPDATE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const PROFILE_UPDATE_RATE_LIMIT = 10;

const AVATAR_UPDATE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const AVATAR_UPDATE_RATE_LIMIT = 20;

export async function updateProfile(
  input: unknown
): Promise<
  { ok: true } | { ok: false; error: "invalid" | "usernameTaken" | "rateLimited" | "generic" }
> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const { limited } = await checkRateLimit(
    `profile-update:${session.user.id}`,
    PROFILE_UPDATE_RATE_LIMIT,
    PROFILE_UPDATE_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    if (parsed.data.username) {
      const [existing] = await getDb()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, parsed.data.username))
        .limit(1);
      if (existing && existing.id !== session.user.id) {
        return { ok: false, error: "usernameTaken" };
      }
    }

    await getDb()
      .update(users)
      .set({ displayName: parsed.data.displayName, username: parsed.data.username })
      .where(eq(users.id, session.user.id));

    revalidatePath("/account");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { ok: false, error: "generic" };
  }
}

export async function updateAvatarEmoji(
  emoji: string
): Promise<{ ok: true } | { ok: false; error: "invalid" | "rateLimited" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  if (!isBuiltinAvatar(emoji)) {
    return { ok: false, error: "invalid" };
  }

  const { limited } = await checkRateLimit(
    `avatar-update:${session.user.id}`,
    AVATAR_UPDATE_RATE_LIMIT,
    AVATAR_UPDATE_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    const oldPublicId = session.user.avatarPublicId;

    await getDb()
      .update(users)
      .set({ avatarEmoji: emoji, avatarUrl: null, avatarPublicId: null })
      .where(eq(users.id, session.user.id));

    if (oldPublicId) {
      await deleteMedia(oldPublicId);
    }

    revalidatePath("/account");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update avatar emoji:", error);
    return { ok: false, error: "generic" };
  }
}

export async function uploadAvatarImage(formData: FormData): Promise<
  | { ok: true; url: string }
  | {
      ok: false;
      error: "notConfigured" | "invalid" | "tooLarge" | "unsupportedFormat" | "broken" | "rateLimited" | "generic";
    }
> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  if (!isCloudinaryConfigured()) {
    return { ok: false, error: "notConfigured" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "invalid" };
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "tooLarge" };
  }

  if (!(ALLOWED_AVATAR_MIME as readonly string[]).includes(file.type)) {
    return { ok: false, error: "unsupportedFormat" };
  }

  const { limited } = await checkRateLimit(
    `avatar-update:${session.user.id}`,
    AVATAR_UPDATE_RATE_LIMIT,
    AVATAR_UPDATE_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isAllowedAvatarFileType(detectFileType(buffer))) {
    return { ok: false, error: "broken" };
  }

  try {
    const { url, publicId } = await uploadAvatarMedia(file);
    const oldPublicId = session.user.avatarPublicId;

    await getDb()
      .update(users)
      .set({ avatarUrl: url, avatarEmoji: null, avatarPublicId: publicId })
      .where(eq(users.id, session.user.id));

    if (oldPublicId) {
      await deleteMedia(oldPublicId);
    }

    revalidatePath("/account");
    return { ok: true, url };
  } catch (error) {
    console.error("Failed to upload avatar image:", error);
    return { ok: false, error: "generic" };
  }
}

export async function removeAvatar(): Promise<{ ok: true } | { ok: false; error: "invalid" | "generic" }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  try {
    const oldPublicId = session.user.avatarPublicId;

    await getDb()
      .update(users)
      .set({ avatarUrl: null, avatarEmoji: null, avatarPublicId: null })
      .where(eq(users.id, session.user.id));

    if (oldPublicId) {
      await deleteMedia(oldPublicId);
    }

    revalidatePath("/account");
    return { ok: true };
  } catch (error) {
    console.error("Failed to remove avatar:", error);
    return { ok: false, error: "generic" };
  }
}

export async function signOutEverywhere(): Promise<{ ok: boolean }> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false };
  }

  await destroyOtherSessions(session.user.id, session.sessionId);
  return { ok: true };
}
