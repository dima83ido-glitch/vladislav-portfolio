"use client";

import { useState, type FormEvent } from "react";
import { updateAboutContent } from "@/lib/cms/content/actions";
import { ICON_NAMES } from "@/lib/cms/icons";
import type { AboutContent } from "@/db/schema";

const LOCALES = ["en", "uk", "ru"] as const;

type LocalizedText = { en: string; uk: string; ru: string };

function toLocalized(v?: { en?: string; uk?: string; ru?: string }): LocalizedText {
  return { en: v?.en ?? "", uk: v?.uk ?? "", ru: v?.ru ?? "" };
}

const DEFAULT_CARDS = [
  { icon: "pen-tool", title: "", description: "" },
  { icon: "zap", title: "", description: "" },
  { icon: "layers", title: "", description: "" },
  { icon: "users", title: "", description: "" },
];

const DEFAULT_STATS = [
  { value: 150, suffix: "+", label: "" },
  { value: 5, suffix: "+", label: "" },
  { value: 98, suffix: "%", label: "" },
];

export function AboutContentForm({ content }: { content: AboutContent | null }) {
  const [biography, setBiography] = useState<LocalizedText>({
    en: content?.biography.en?.join("\n\n") ?? "",
    uk: content?.biography.uk?.join("\n\n") ?? "",
    ru: content?.biography.ru?.join("\n\n") ?? "",
  });

  const [cards, setCards] = useState(
    (content?.philosophyCards ?? DEFAULT_CARDS).map((c) => ({
      icon: c.icon,
      title: toLocalized(c.title as Partial<LocalizedText> | undefined),
      description: toLocalized(c.description as Partial<LocalizedText> | undefined),
    }))
  );

  const [stats, setStats] = useState(
    (content?.heroStats ?? DEFAULT_STATS).map((s) => ({
      value: s.value,
      suffix: s.suffix,
      label: toLocalized(s.label as Partial<LocalizedText> | undefined),
    }))
  );

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);
    setSuccess(false);

    const result = await updateAboutContent({
      biography: {
        en: biography.en.split("\n\n").map((p) => p.trim()).filter(Boolean),
        uk: biography.uk.split("\n\n").map((p) => p.trim()).filter(Boolean),
        ru: biography.ru.split("\n\n").map((p) => p.trim()).filter(Boolean),
      },
      philosophyCards: cards,
      heroStats: stats,
    });

    setIsPending(false);

    if (!result.ok) {
      setError("Please check every field — English is required everywhere.");
      return;
    }
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          Biography (paragraphs separated by a blank line)
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <textarea
              key={locale}
              value={biography[locale]}
              onChange={(e) => setBiography((prev) => ({ ...prev, [locale]: e.target.value }))}
              rows={6}
              placeholder={locale.toUpperCase()}
              className="resize-none rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold text-foreground">Philosophy cards (4)</span>
        {cards.map((card, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-5">
            <select
              value={card.icon}
              onChange={(e) =>
                setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, icon: e.target.value } : c)))
              }
              className="w-fit rounded-lg border border-line-strong bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-blue-soft"
            >
              {ICON_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {LOCALES.map((locale) => (
                <input
                  key={locale}
                  value={card.title[locale]}
                  onChange={(e) =>
                    setCards((prev) =>
                      prev.map((c, idx) => (idx === i ? { ...c, title: { ...c.title, [locale]: e.target.value } } : c))
                    )
                  }
                  placeholder={`Title (${locale.toUpperCase()})`}
                  className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {LOCALES.map((locale) => (
                <input
                  key={locale}
                  value={card.description[locale]}
                  onChange={(e) =>
                    setCards((prev) =>
                      prev.map((c, idx) =>
                        idx === i ? { ...c, description: { ...c.description, [locale]: e.target.value } } : c
                      )
                    )
                  }
                  placeholder={`Description (${locale.toUpperCase()})`}
                  className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-semibold text-foreground">Hero stats (3)</span>
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/50 p-5 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <input
                type="number"
                value={stat.value}
                onChange={(e) =>
                  setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, value: Number(e.target.value) } : s)))
                }
                className="w-24 rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
              />
              <input
                value={stat.suffix}
                onChange={(e) =>
                  setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, suffix: e.target.value } : s)))
                }
                placeholder="+"
                className="w-16 rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
              />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              {LOCALES.map((locale) => (
                <input
                  key={locale}
                  value={stat.label[locale]}
                  onChange={(e) =>
                    setStats((prev) =>
                      prev.map((s, idx) => (idx === i ? { ...s, label: { ...s.label, [locale]: e.target.value } } : s))
                    )
                  }
                  placeholder={`Label (${locale.toUpperCase()})`}
                  className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">Saved.</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-blue-soft disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
