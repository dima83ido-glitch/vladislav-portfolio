import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getClientIp,
  isPrivateOrLocalIp,
  resolveAutoLocale,
  resolveCountryLocale,
  resolveLocaleFromAcceptLanguage,
  resolveLocaleFromCountry,
} from "./geo-locale";

describe("isPrivateOrLocalIp", () => {
  it("flags loopback and private ranges", () => {
    expect(isPrivateOrLocalIp("127.0.0.1")).toBe(true);
    expect(isPrivateOrLocalIp("::1")).toBe(true);
    expect(isPrivateOrLocalIp("10.0.0.5")).toBe(true);
    expect(isPrivateOrLocalIp("192.168.1.20")).toBe(true);
    expect(isPrivateOrLocalIp("172.16.0.1")).toBe(true);
    expect(isPrivateOrLocalIp("172.31.255.255")).toBe(true);
    expect(isPrivateOrLocalIp("169.254.1.1")).toBe(true);
  });

  it("does not flag a public IP", () => {
    expect(isPrivateOrLocalIp("8.8.8.8")).toBe(false);
    expect(isPrivateOrLocalIp("172.32.0.1")).toBe(false);
    expect(isPrivateOrLocalIp("1.1.1.1")).toBe(false);
  });
});

describe("getClientIp", () => {
  it("takes the first hop from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.9" });
    expect(getClientIp(headers)).toBe("203.0.113.9");
  });

  it("returns null when neither header is present", () => {
    expect(getClientIp(new Headers())).toBeNull();
  });
});

describe("resolveCountryLocale", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps UA to uk", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, country_code: "UA" }),
      })
    );
    expect(await resolveCountryLocale("1.2.3.4")).toBe("uk");
  });

  it("maps RU to ru", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, country_code: "RU" }),
      })
    );
    expect(await resolveCountryLocale("1.2.3.4")).toBe("ru");
  });

  it("maps any other country to en", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, country_code: "US" }),
      })
    );
    expect(await resolveCountryLocale("1.2.3.4")).toBe("en");
  });

  it("returns null when the lookup reports failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, message: "Reserved range" }),
      })
    );
    expect(await resolveCountryLocale("127.0.0.1")).toBeNull();
  });

  it("returns null on a non-ok HTTP response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await resolveCountryLocale("1.2.3.4")).toBeNull();
  });

  it("returns null instead of throwing on a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await resolveCountryLocale("1.2.3.4")).toBeNull();
  });
});

describe("resolveLocaleFromCountry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skips the lookup entirely for a private IP", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const headers = new Headers({ "x-forwarded-for": "127.0.0.1" });
    expect(await resolveLocaleFromCountry(headers)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips the lookup when no IP header is present", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await resolveLocaleFromCountry(new Headers())).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves via the country lookup for a public IP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, country_code: "UA" }),
      })
    );
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5" });
    expect(await resolveLocaleFromCountry(headers)).toBe("uk");
  });
});

describe("resolveLocaleFromAcceptLanguage", () => {
  it("matches Ukrainian", () => {
    expect(resolveLocaleFromAcceptLanguage(new Headers({ "accept-language": "uk-UA,uk;q=0.9" }))).toBe(
      "uk"
    );
  });

  it("matches Russian", () => {
    expect(resolveLocaleFromAcceptLanguage(new Headers({ "accept-language": "ru-RU,ru;q=0.9" }))).toBe(
      "ru"
    );
  });

  it("picks the highest-quality supported tag, not just the first one", () => {
    const headers = new Headers({ "accept-language": "fr-FR;q=0.9,ru-RU;q=0.95,de;q=0.5" });
    expect(resolveLocaleFromAcceptLanguage(headers)).toBe("ru");
  });

  it("falls back to English for an unsupported language", () => {
    expect(resolveLocaleFromAcceptLanguage(new Headers({ "accept-language": "de-DE,de;q=0.9" }))).toBe(
      "en"
    );
  });

  it("falls back to English when the header is missing", () => {
    expect(resolveLocaleFromAcceptLanguage(new Headers())).toBe("en");
  });
});

describe("resolveAutoLocale", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers the country result over Accept-Language", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, country_code: "US" }),
      })
    );
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5",
      "accept-language": "ru-RU,ru;q=0.9",
    });
    // Country resolves to "en" (a definitive, successful lookup) even
    // though the browser prefers Russian — country takes priority.
    expect(await resolveAutoLocale(headers)).toBe("en");
  });

  it("falls back to Accept-Language when the country can't be determined", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5",
      "accept-language": "uk-UA,uk;q=0.9",
    });
    expect(await resolveAutoLocale(headers)).toBe("uk");
  });

  it("falls back to English when both signals are unavailable", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await resolveAutoLocale(new Headers())).toBe("en");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
