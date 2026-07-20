import { z } from "zod";

/**
 * Reviews require a logged-in session (see submitReview) — the author's
 * name/email come from the account, not the form, so this only validates
 * what the visitor actually supplies.
 */
export const reviewSubmissionSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
  locale: z.string().trim().min(2).max(5),
  // Honeypot: must always arrive empty. Bots that fill every field trip this.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ReviewSubmissionInput = z.input<typeof reviewSubmissionSchema>;
