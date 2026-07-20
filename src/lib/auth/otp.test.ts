import { describe, expect, it } from "vitest";
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  generateOtpCode,
  hasExceededAttempts,
  hashOtpCode,
  isOtpExpired,
} from "./otp";

describe("generateOtpCode", () => {
  it("produces a zero-padded numeric code of the configured length", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode();
      expect(code).toHaveLength(OTP_LENGTH);
      expect(code).toMatch(/^\d+$/);
    }
  });
});

describe("hashOtpCode", () => {
  it("is deterministic for the same input", () => {
    expect(hashOtpCode("123456")).toBe(hashOtpCode("123456"));
  });

  it("produces different hashes for different codes", () => {
    expect(hashOtpCode("123456")).not.toBe(hashOtpCode("654321"));
  });

  it("never returns the plaintext code", () => {
    expect(hashOtpCode("123456")).not.toBe("123456");
  });
});

describe("isOtpExpired", () => {
  it("is false before the expiry time", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expiresAt = new Date("2026-01-01T00:10:00Z");
    expect(isOtpExpired(expiresAt, now)).toBe(false);
  });

  it("is true after the expiry time", () => {
    const now = new Date("2026-01-01T00:11:00Z");
    const expiresAt = new Date("2026-01-01T00:10:00Z");
    expect(isOtpExpired(expiresAt, now)).toBe(true);
  });
});

describe("hasExceededAttempts", () => {
  it("is false below the limit", () => {
    expect(hasExceededAttempts(OTP_MAX_ATTEMPTS - 1)).toBe(false);
  });

  it("is true at or above the limit", () => {
    expect(hasExceededAttempts(OTP_MAX_ATTEMPTS)).toBe(true);
    expect(hasExceededAttempts(OTP_MAX_ATTEMPTS + 1)).toBe(true);
  });
});
