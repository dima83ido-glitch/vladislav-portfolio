import { describe, expect, it } from "vitest";
import { projectSchema } from "./validation";

const validInput = {
  slug: "acme-redesign",
  title: { en: "Acme Redesign", uk: "", ru: "" },
  category: { en: "Web App", uk: "", ru: "" },
  description: { en: "A full redesign of the Acme dashboard.", uk: "", ru: "" },
  results: { en: "40% faster load times.", uk: "", ru: "" },
  technologies: ["Next.js", "TypeScript"],
  coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/cover.png",
  coverImagePublicId: "vladislav-portfolio/portfolio/cover",
  videoUrl: "",
  liveUrl: "https://acme.example.com",
  githubUrl: "",
  seoTitle: { en: "", uk: "", ru: "" },
  seoDescription: { en: "", uk: "", ru: "" },
  sortOrder: 0,
  status: "published" as const,
};

describe("projectSchema", () => {
  it("accepts a valid project", () => {
    expect(projectSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a project with no optional fields filled in", () => {
    const minimal = {
      slug: "minimal-project",
      title: { en: "Minimal Project" },
      category: { en: "Landing Page" },
      description: { en: "A small marketing site." },
      technologies: [],
      status: "draft" as const,
    };
    expect(projectSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects a missing English title", () => {
    expect(
      projectSchema.safeParse({ ...validInput, title: { en: "", uk: "", ru: "" } }).success
    ).toBe(false);
  });

  it("rejects a missing English category", () => {
    expect(
      projectSchema.safeParse({ ...validInput, category: { en: "", uk: "", ru: "" } }).success
    ).toBe(false);
  });

  it("rejects a missing English description", () => {
    expect(
      projectSchema.safeParse({ ...validInput, description: { en: "", uk: "", ru: "" } }).success
    ).toBe(false);
  });

  it("rejects an invalid slug", () => {
    expect(projectSchema.safeParse({ ...validInput, slug: "Not A Slug!" }).success).toBe(false);
  });

  it("rejects a malformed cover image URL", () => {
    expect(
      projectSchema.safeParse({ ...validInput, coverImageUrl: "not-a-url" }).success
    ).toBe(false);
  });

  it("accepts an empty cover image URL", () => {
    expect(projectSchema.safeParse({ ...validInput, coverImageUrl: "" }).success).toBe(true);
  });

  it("rejects more than 12 technologies", () => {
    const tooMany = Array.from({ length: 13 }, (_, i) => `Tech ${i}`);
    expect(projectSchema.safeParse({ ...validInput, technologies: tooMany }).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(projectSchema.safeParse({ ...validInput, status: "archived" }).success).toBe(false);
  });
});
