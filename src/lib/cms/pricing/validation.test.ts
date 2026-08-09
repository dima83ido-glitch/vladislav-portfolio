import { describe, expect, it } from "vitest";
import { planSchema } from "./validation";

const validInput = {
  slug: "growth",
  name: { en: "Growth", uk: "Ріст", ru: "Рост" },
  description: { en: "For scaling teams.", uk: "", ru: "" },
  features: { en: ["Feature one", "Feature two"], uk: [], ru: [] },
  price: "$3,200",
  priceCents: 320000,
  periodKey: "oneTime" as const,
  highlighted: false,
  showOnHomepage: true,
  ctaOverrideHref: "",
  sortOrder: 1,
  status: "published" as const,
};

describe("planSchema", () => {
  it("accepts a valid plan", () => {
    expect(planSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a quote-only plan with no priceCents", () => {
    const quoteInput: Record<string, unknown> = { ...validInput, periodKey: "quote" };
    delete quoteInput.priceCents;
    expect(planSchema.safeParse(quoteInput).success).toBe(true);
  });

  it("rejects a missing English name", () => {
    expect(
      planSchema.safeParse({ ...validInput, name: { en: "", uk: "Ріст", ru: "Рост" } }).success
    ).toBe(false);
  });

  it("rejects a missing English description", () => {
    expect(
      planSchema.safeParse({ ...validInput, description: { en: "", uk: "", ru: "" } }).success
    ).toBe(false);
  });

  it("rejects an empty English features list", () => {
    expect(
      planSchema.safeParse({ ...validInput, features: { en: [], uk: [], ru: [] } }).success
    ).toBe(false);
  });

  it("rejects an invalid slug", () => {
    expect(planSchema.safeParse({ ...validInput, slug: "Not A Slug!" }).success).toBe(false);
    expect(planSchema.safeParse({ ...validInput, slug: "a" }).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(planSchema.safeParse({ ...validInput, status: "archived" }).success).toBe(false);
  });

  it("rejects a negative priceCents", () => {
    expect(planSchema.safeParse({ ...validInput, priceCents: -100 }).success).toBe(false);
  });
});
