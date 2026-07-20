import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  authorEmail: z.string().trim().toLowerCase().email(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
  locale: z.string().trim().min(2).max(5),
  // Honeypot: must always arrive empty. Bots that fill every field trip this.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ReviewSubmissionInput = z.input<typeof reviewSubmissionSchema>;
