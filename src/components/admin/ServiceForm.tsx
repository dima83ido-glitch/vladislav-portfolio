"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createService, updateService } from "@/lib/cms/content/actions";
import { ICON_NAMES } from "@/lib/cms/icons";
import type { Service } from "@/db/schema";

const LOCALES = ["en", "uk", "ru"] as const;

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const t = useTranslations("admin.content.services");
  const commonT = useTranslations("admin.common");

  const [slug, setSlug] = useState(service?.slug ?? "");
  const [icon, setIcon] = useState(service?.icon ?? ICON_NAMES[0]);
  const [title, setTitle] = useState({
    en: service?.title.en ?? "",
    uk: service?.title.uk ?? "",
    ru: service?.title.ru ?? "",
  });
  const [description, setDescription] = useState({
    en: service?.description.en ?? "",
    uk: service?.description.uk ?? "",
    ru: service?.description.ru ?? "",
  });
  const [features, setFeatures] = useState({
    en: service?.features.en?.join("\n") ?? "",
    uk: service?.features.uk?.join("\n") ?? "",
    ru: service?.features.ru?.join("\n") ?? "",
  });
  const [sortOrder, setSortOrder] = useState(service?.sortOrder ?? 0);
  const [status, setStatus] = useState<"draft" | "published">(service?.status ?? "draft");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);

    const payload = {
      slug,
      icon,
      title,
      description,
      features: {
        en: features.en.split("\n").map((f) => f.trim()).filter(Boolean),
        uk: features.uk.split("\n").map((f) => f.trim()).filter(Boolean),
        ru: features.ru.split("\n").map((f) => f.trim()).filter(Boolean),
      },
      sortOrder,
      status,
    };

    const result = service ? await updateService(service.id, payload) : await createService(payload);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error === "slugTaken" ? commonT("errorSlugTaken") : commonT("errorCheckFields"));
      return;
    }

    router.push("/admin/content/services");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("slug")}</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            required
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("icon")}</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          >
            {ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(["title", "description"] as const).map((field) => (
        <div key={field} className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {field === "title" ? commonT("title") : commonT("description")}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LOCALES.map((locale) => (
              <input
                key={locale}
                value={(field === "title" ? title : description)[locale]}
                onChange={(e) =>
                  (field === "title" ? setTitle : setDescription)((prev) => ({
                    ...prev,
                    [locale]: e.target.value,
                  }))
                }
                placeholder={locale.toUpperCase()}
                className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("features")}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <textarea
              key={locale}
              value={features[locale]}
              onChange={(e) => setFeatures((prev) => ({ ...prev, [locale]: e.target.value }))}
              rows={3}
              placeholder={locale.toUpperCase()}
              className="resize-none rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("sortOrder")}</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-24 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          >
            <option value="draft">{commonT("draft")}</option>
            <option value="published">{commonT("published")}</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-blue-soft disabled:opacity-50"
      >
        {isPending ? commonT("saving") : service ? commonT("saveChanges") : t("create")}
      </button>
    </form>
  );
}
