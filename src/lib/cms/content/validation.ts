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

export const aboutContentSchema = z.object({
  biography: localizedList,
  philosophyCards: z
    .array(z.object({ icon: z.string().trim().min(1), title: localizedText, description: localizedText }))
    .length(4),
  heroStats: z
    .array(
      z.object({
        value: z.coerce.number().int().positive(),
        suffix: z.string().trim().max(5),
        label: localizedText,
      })
    )
    .length(3),
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,60}$/),
  icon: z.string().trim().min(1),
  title: localizedText,
  description: localizedText,
  features: localizedList,
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]),
});

export const skillGroupSchema = z.object({
  category: localizedText,
  sortOrder: z.coerce.number().int().default(0),
  skills: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        level: z.coerce.number().int().min(0).max(100),
        sortOrder: z.coerce.number().int().default(0),
      })
    )
    .min(1),
});

export type AboutContentInput = z.infer<typeof aboutContentSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type SkillGroupInput = z.infer<typeof skillGroupSchema>;
