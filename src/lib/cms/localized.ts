import type { LocalizedList, LocalizedText } from "@/db/schema";

export function resolveLocalizedText(field: LocalizedText, locale: string): string {
  return (field as Record<string, string | undefined>)[locale] || field.en;
}

export function resolveLocalizedList(field: LocalizedList, locale: string): string[] {
  return (field as Record<string, string[] | undefined>)[locale] || field.en;
}
