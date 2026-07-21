import { z } from "zod";

const localizedText = z.object({
  en: z.string().trim().min(1),
  uk: z.string().trim().optional(),
  ru: z.string().trim().optional(),
});

const localizedList = z.object({
  en: z.array(z.string().trim().min(1)).min(1),
  uk: z.array(z.string().trim().min(1)).optional(),
  ru: z.array(z.string().trim().min(1)).optional(),
});

export const planSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,60}$/),
  name: localizedText,
  description: localizedText,
  features: localizedList,
  price: z.string().trim().max(40),
  priceCents: z.coerce.number().int().positive().optional(),
  periodKey: z.enum(["oneTime", "quote"]),
  highlighted: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  ctaOverrideHref: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]),
});

export type PlanInput = z.infer<typeof planSchema>;
