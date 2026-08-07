import type { DetectedFileType } from "@/lib/media/validation";

export const BUILTIN_AVATARS = [
  "🐶",
  "🐱",
  "🦊",
  "🐼",
  "🦁",
  "🐯",
  "🐸",
  "🐻",
  "🐨",
  "🐧",
] as const;

export type BuiltinAvatar = (typeof BUILTIN_AVATARS)[number];

export function isBuiltinAvatar(value: string): value is BuiltinAvatar {
  return (BUILTIN_AVATARS as readonly string[]).includes(value);
}

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const ALLOWED_AVATAR_MIME = ["image/png", "image/jpeg", "image/webp"] as const;

const ALLOWED_AVATAR_FILE_TYPES = ["png", "jpeg", "webp"] as const;

/**
 * Avatars only ever accept raster photo formats — reject even if the shared
 * detector recognizes the bytes as a valid SVG/PDF, since neither belongs
 * as a profile picture.
 */
export function isAllowedAvatarFileType(type: DetectedFileType | null): boolean {
  return type !== null && (ALLOWED_AVATAR_FILE_TYPES as readonly string[]).includes(type);
}
