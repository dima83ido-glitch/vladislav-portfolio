"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createProject, updateProject, uploadProjectCoverImage } from "@/lib/cms/portfolio/actions";
import type { PortfolioProject } from "@/db/schema";

const LOCALES = ["en", "uk", "ru"] as const;

type LocalizedFieldName = "title" | "category" | "description" | "results" | "seoTitle" | "seoDescription";

export function ProjectForm({ project }: { project?: PortfolioProject }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("admin.common");
  const pt = useTranslations("admin.portfolio");

  const [slug, setSlug] = useState(project?.slug ?? "");
  const [fields, setFields] = useState<Record<LocalizedFieldName, { en: string; uk: string; ru: string }>>({
    title: { en: project?.title.en ?? "", uk: project?.title.uk ?? "", ru: project?.title.ru ?? "" },
    category: { en: project?.category.en ?? "", uk: project?.category.uk ?? "", ru: project?.category.ru ?? "" },
    description: {
      en: project?.description.en ?? "",
      uk: project?.description.uk ?? "",
      ru: project?.description.ru ?? "",
    },
    results: { en: project?.results?.en ?? "", uk: project?.results?.uk ?? "", ru: project?.results?.ru ?? "" },
    seoTitle: { en: project?.seoTitle?.en ?? "", uk: project?.seoTitle?.uk ?? "", ru: project?.seoTitle?.ru ?? "" },
    seoDescription: {
      en: project?.seoDescription?.en ?? "",
      uk: project?.seoDescription?.uk ?? "",
      ru: project?.seoDescription?.ru ?? "",
    },
  });
  const [technologies, setTechnologies] = useState(project?.technologies.join(", ") ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(project?.coverImageUrl ?? "");
  const [coverImagePublicId, setCoverImagePublicId] = useState(project?.coverImagePublicId ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [sortOrder, setSortOrder] = useState(project?.sortOrder ?? 0);
  const [status, setStatus] = useState<"draft" | "published">(project?.status ?? "draft");

  const [isUploading, setIsUploading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(name: LocalizedFieldName, locale: (typeof LOCALES)[number], value: string) {
    setFields((prev) => ({ ...prev, [name]: { ...prev[name], [locale]: value } }));
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProjectCoverImage(formData);
    setIsUploading(false);

    if (!result.ok) {
      const errorKey =
        result.error === "notConfigured"
          ? "mediaNotConfigured"
          : result.error === "tooLarge"
            ? "uploadTooLarge"
            : result.error === "unsupportedFormat" || result.error === "broken"
              ? "uploadUnsupportedFormat"
              : result.error === "rateLimited"
                ? "uploadRateLimited"
                : "uploadFailed";
      setError(pt(errorKey));
      return;
    }
    setCoverImageUrl(result.url);
    setCoverImagePublicId(result.publicId);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);

    const payload = {
      slug,
      title: fields.title,
      category: fields.category,
      description: fields.description,
      results: fields.results,
      technologies: technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImageUrl,
      coverImagePublicId,
      videoUrl,
      liveUrl,
      githubUrl,
      seoTitle: fields.seoTitle,
      seoDescription: fields.seoDescription,
      sortOrder,
      status,
    };

    const result = project ? await updateProject(project.id, payload) : await createProject(payload);
    setIsPending(false);

    if (!result.ok) {
      setError(
        result.error === "slugTaken"
          ? t("errorSlugTaken")
          : result.error === "invalid"
            ? t("errorCheckFields")
            : t("errorGeneric")
      );
      return;
    }

    router.push("/admin/portfolio");
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
          placeholder="my-client-project"
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
      </div>

      {(["title", "category", "description", "results"] as LocalizedFieldName[]).map((name) => (
        <div key={name} className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {t(name)} {name === "results" ? t("optional") : ""}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LOCALES.map((locale) => (
              <input
                key={locale}
                value={fields[name][locale]}
                onChange={(e) => setField(name, locale, e.target.value)}
                placeholder={locale.toUpperCase()}
                className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {pt("technologies")}
        </label>
        <input
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="Next.js, TypeScript, PostgreSQL"
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{pt("coverImage")}</label>
        <div className="flex flex-wrap items-center gap-3">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" className="h-16 w-24 rounded-lg object-cover" />
          ) : null}
          <input ref={fileInputRef} type="file" accept="image/*" className="text-xs text-muted" />
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-blue-soft disabled:opacity-50"
          >
            {isUploading ? pt("uploading") : pt("upload")}
          </button>
        </div>
        <input
          value={coverImageUrl}
          onChange={(e) => {
            setCoverImageUrl(e.target.value);
            // Only a publicId that came back from an actual upload response is
            // ever trusted for later cleanup — a manually pasted URL might not
            // even be a Cloudinary asset, so never carry a stale publicId into it.
            setCoverImagePublicId("");
          }}
          placeholder={pt("orPasteUrl")}
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {pt("videoUrl")}
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{pt("liveUrl")}</label>
          <input
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{pt("githubUrl")}</label>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
      </div>

      {(["seoTitle", "seoDescription"] as LocalizedFieldName[]).map((name) => (
        <div key={name} className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {t(name)} {t("optional")}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LOCALES.map((locale) => (
              <input
                key={locale}
                value={fields[name][locale]}
                onChange={(e) => setField(name, locale, e.target.value)}
                placeholder={locale.toUpperCase()}
                className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{t("sortOrder")}</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-24 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{t("status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
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
        {isPending ? t("saving") : project ? t("saveChanges") : pt("create")}
      </button>
    </form>
  );
}
