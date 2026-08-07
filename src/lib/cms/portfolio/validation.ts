import { z } from "zod";

const localizedText = z.object({
  en: z.string().trim().min(1),
  uk: z.string().trim().optional(),
  ru: z.string().trim().optional(),
});

const localizedTextOptional = z.object({
  en: z.string().trim().optional(),
  uk: z.string().trim().optional(),
  ru: z.string().trim().optional(),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,60}$/),
  title: localizedText,
  category: localizedText,
  description: localizedText,
  results: localizedTextOptional.optional(),
  technologies: z.array(z.string().trim().min(1)).max(12),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  coverImagePublicId: z.string().trim().optional().or(z.literal("")),
  videoUrl: z.string().trim().url().optional().or(z.literal("")),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  seoTitle: localizedTextOptional.optional(),
  seoDescription: localizedTextOptional.optional(),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published"]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
