import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export { PASSWORD_MIN_LENGTH } from "./password.constants";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/** Stored as `salt:hash`, both hex — self-contained, no separate column needed. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const stored_ = Buffer.from(hashHex, "hex");

  if (derived.length !== stored_.length) return false;
  return timingSafeEqual(derived, stored_);
}
