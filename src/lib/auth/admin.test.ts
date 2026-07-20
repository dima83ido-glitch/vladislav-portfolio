import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAdminEmail } from "./admin";

describe("isAdminEmail", () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    process.env.ADMIN_EMAIL = "owner@example.com";
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalAdminEmail;
  });

  it("matches the configured admin email exactly", () => {
    expect(isAdminEmail("owner@example.com")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAdminEmail("Owner@Example.com")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(isAdminEmail("  owner@example.com  ")).toBe(true);
  });

  it("rejects any other email", () => {
    expect(isAdminEmail("someone-else@example.com")).toBe(false);
  });

  it("rejects everything when ADMIN_EMAIL is not configured", () => {
    delete process.env.ADMIN_EMAIL;
    expect(isAdminEmail("owner@example.com")).toBe(false);
  });
});
