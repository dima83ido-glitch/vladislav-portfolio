import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(60)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,24}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});
