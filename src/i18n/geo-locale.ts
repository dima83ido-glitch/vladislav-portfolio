import type { Locale } from "./routing";

const GEO_LOOKUP_TIMEOUT_MS = 2000;

// Only Ukraine and Russia get a dedicated locale; every other country (and
// every case where the country can't be determined) resolves to English.
const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  UA: "uk",
  RU: "ru",
};

/**
 * True for loopback/private/link-local ranges, where a public geo-IP
 * lookup can't return anything meaningful (e.g. local dev, or a request
 * that reaches us without a real forwarded client IP).
 */
export function isPrivateOrLocalIp(ip: string): boolean {
  const value = ip.trim();
  if (value === "127.0.0.1" || value === "::1" || value === "localhost") return true;
  if (/^10\./.test(value)) return true;
  if (/^192\.168\./.test(value)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) return true;
  if (/^169\.254\./.test(value)) return true; // link-local
  if (/^f[cd][0-9a-f]{2}:/i.test(value)) return true; // IPv6 unique local (fc00::/7)
  if (/^fe80:/i.test(value)) return true; // IPv6 link-local
  return false;
}

/**
 * The client IP as seen by Render's reverse proxy (or any standard one in
 * front of the app). `x-forwarded-for` may list several hops as
 * "client, proxy1, proxy2" — the first entry is the original client.
 */
export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return null;
}

type GeoLookupResponse = { success?: boolean; country_code?: string };

/**
 * Resolves a locale purely from an IP-derived country — no physical
 * GPS/browser Geolocation, no permission prompt, no coordinates, just the
 * two-letter country code for the visitor's IP. Returns null (never
 * throws) whenever the country genuinely can't be determined, so the
 * caller can fall back to Accept-Language and ultimately English.
 */
export async function resolveCountryLocale(ip: string): Promise<Locale | null> {
  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code`,
      { signal: AbortSignal.timeout(GEO_LOOKUP_TIMEOUT_MS) }
    );
    if (!response.ok) return null;

    const data = (await response.json()) as GeoLookupResponse;
    if (!data.success || !data.country_code) return null;

    return COUNTRY_LOCALE_MAP[data.country_code.toUpperCase()] ?? "en";
  } catch {
    // Network error, timeout, malformed JSON — all treated the same: the
    // country couldn't be determined this time, not a hard failure.
    return null;
  }
}

/**
 * Combines client-IP extraction with the country lookup. Returns null for
 * local/private IPs (nothing to look up) or when the lookup itself fails,
 * so the caller's own Accept-Language / English fallback chain takes over.
 */
export async function resolveLocaleFromCountry(headers: Headers): Promise<Locale | null> {
  const ip = getClientIp(headers);
  if (!ip || isPrivateOrLocalIp(ip)) return null;
  return resolveCountryLocale(ip);
}

function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      const q = qPart ? Number.parseFloat(qPart) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
}

/**
 * Same UA/RU-only mapping as the country lookup, applied to the browser's
 * preferred languages instead of its IP — the fallback for when the
 * country genuinely can't be determined. Never returns null: an absent or
 * unmatched header (e.g. "de-DE", or none at all) resolves to English,
 * exactly like an "other country" would.
 */
export function resolveLocaleFromAcceptLanguage(headers: Headers): Locale {
  const header = headers.get("accept-language");
  if (!header) return "en";

  for (const tag of parseAcceptLanguage(header)) {
    const primary = tag.split("-")[0];
    if (primary === "uk") return "uk";
    if (primary === "ru") return "ru";
  }
  return "en";
}

/**
 * The full auto-detection chain used on a visitor's very first request:
 * IP-derived country first, then the browser's Accept-Language, and
 * finally English — always resolves, never null, so the caller can
 * unconditionally persist whatever comes back.
 */
export async function resolveAutoLocale(headers: Headers): Promise<Locale> {
  const geoLocale = await resolveLocaleFromCountry(headers);
  return geoLocale ?? resolveLocaleFromAcceptLanguage(headers);
}
