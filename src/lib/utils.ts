import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(source: { displayName?: string | null; email: string }): string {
  const text = source.displayName || source.email;
  return text.slice(0, 2).toUpperCase();
}
