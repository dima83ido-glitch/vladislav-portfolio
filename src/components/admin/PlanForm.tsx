"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createPlan, updatePlan } from "@/lib/cms/pricing/actions";
import type { PricingPlan as DbPricingPlan } from "@/db/schema";

const LOCALES = ["en", "uk", "ru"] as const;

export function PlanForm({ plan }: { plan?: DbPricingPlan }) {
  const router = useRouter();
  const t = useTranslations("admin.common");
  const pt = useTranslations("admin.pricing");

  const [slug, setSlug] = useState(plan?.slug ?? "");
  const [name, setName] = useState({ en: plan?.name.en ?? "", uk: plan?.name.uk ?? "", ru: plan?.name.ru ?? "" });
  const [description, setDescription] = useState({
    en: plan?.description.en ?? "",
    uk: plan?.description.uk ?? "",
    ru: plan?.description.ru ?? "",
  });
  const [features, setFeatures] = useState({
    en: plan?.features.en?.join("\n") ?? "",
    uk: plan?.features.uk?.join("\n") ?? "",
    ru: plan?.features.ru?.join("\n") ?? "",
  });
  const [price, setPrice] = useState(plan?.price ?? "");
  const [priceCents, setPriceCents] = useState(plan?.priceCents ? String(plan.priceCents / 100) : "");
  const [periodKey, setPeriodKey] = useState<"oneTime" | "quote">(plan?.periodKey ?? "oneTime");
  const [highlighted, setHighlighted] = useState(plan?.highlighted ?? false);
  const [showOnHomepage, setShowOnHomepage] = useState(plan?.showOnHomepage ?? false);
  const [ctaOverrideHref, setCtaOverrideHref] = useState(plan?.ctaOverrideHref ?? "");
  const [sortOrder, setSortOrder] = useState(plan?.sortOrder ?? 0);
  const [status, setStatus] = useState<"draft" | "published">(plan?.status ?? "draft");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);

    const payload = {
      slug,
      name,
      description,
      features: {
        en: features.en.split("\n").map((f) => f.trim()).filter(Boolean),
        uk: features.uk.split("\n").map((f) => f.trim()).filter(Boolean),
        ru: features.ru.split("\n").map((f) => f.trim()).filter(Boolean),
      },
      price,
      priceCents: priceCents ? Math.round(Number(priceCents) * 100) : undefined,
      periodKey,
      highlighted,
      showOnHomepage,
      ctaOverrideHref,
      sortOrder,
      status,
    };

    const result = plan ? await updatePlan(plan.id, payload) : await createPlan(payload);
    setIsPending(false);

    if (!result.ok) {
      setError(
        result.error === "slugTaken"
          ? t("errorSlugTaken")
          : result.error === "invalid"
            ? pt("errorCheckFields")
            : t("errorGeneric")
      );
      return;
    }

    router.push("/admin/pricing");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{t("slug")}</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          required
          placeholder="growth"
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{t("name")}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <input
              key={locale}
              value={name[locale]}
              onChange={(e) => setName((prev) => ({ ...prev, [locale]: e.target.value }))}
              placeholder={locale.toUpperCase()}
              className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{t("description")}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <input
              key={locale}
              value={description[locale]}
              onChange={(e) => setDescription((prev) => ({ ...prev, [locale]: e.target.value }))}
              placeholder={locale.toUpperCase()}
              className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("features")}
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <textarea
              key={locale}
              value={features[locale]}
              onChange={(e) => setFeatures((prev) => ({ ...prev, [locale]: e.target.value }))}
              rows={5}
              placeholder={locale.toUpperCase()}
              className="resize-none rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {pt("displayPrice")}
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="$3,200 or Custom"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {pt("amount")}
          </label>
          <input
            type="number"
            step="0.01"
            value={priceCents}
            onChange={(e) => setPriceCents(e.target.value)}
            placeholder="3200"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{pt("period")}</label>
          <select
            value={periodKey}
            onChange={(e) => setPeriodKey(e.target.value as "oneTime" | "quote")}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          >
            <option value="oneTime">{pt("oneTime")}</option>
            <option value="quote">{pt("quote")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{t("sortOrder")}</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {pt("ctaOverride")}
        </label>
        <input
          value={ctaOverrideHref}
          onChange={(e) => setCtaOverrideHref(e.target.value)}
          placeholder="/#contact"
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} />
          {pt("highlighted")}
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={showOnHomepage}
            onChange={(e) => setShowOnHomepage(e.target.checked)}
          />
          {pt("showOnHomepage")}
        </label>
        <div className="flex flex-col gap-1.5">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-xl border border-line-strong bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
          >
            <option value="draft">{t("draft")}</option>
            <option value="published">{t("published")}</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-blue-soft disabled:opacity-50"
      >
        {isPending ? t("saving") : plan ? t("saveChanges") : pt("create")}
      </button>
    </form>
  );
}
