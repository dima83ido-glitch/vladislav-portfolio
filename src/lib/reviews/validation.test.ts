import { describe, expect, it } from "vitest";
import { reviewSubmissionSchema } from "./validation";

const validInput = {
  authorName: "Jane Doe",
  authorEmail: "jane@example.com",
  rating: 5,
  body: "Working with them was a fantastic experience from start to finish.",
  locale: "en",
  website: "",
};

describe("reviewSubmissionSchema", () => {
  it("accepts a valid submission", () => {
    const result = reviewSubmissionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects a rating outside 1-5", () => {
    expect(reviewSubmissionSchema.safeParse({ ...validInput, rating: 0 }).success).toBe(false);
    expect(reviewSubmissionSchema.safeParse({ ...validInput, rating: 6 }).success).toBe(false);
  });

  it("rejects a body that's too short", () => {
    expect(reviewSubmissionSchema.safeParse({ ...validInput, body: "short" }).success).toBe(
      false
    );
  });

  it("rejects an invalid email", () => {
    expect(
      reviewSubmissionSchema.safeParse({ ...validInput, authorEmail: "not-an-email" }).success
    ).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    expect(
      reviewSubmissionSchema.safeParse({ ...validInput, website: "http://spam.example" }).success
    ).toBe(false);
  });

  it("rejects a name that's too short", () => {
    expect(reviewSubmissionSchema.safeParse({ ...validInput, authorName: "J" }).success).toBe(
      false
    );
  });
});
