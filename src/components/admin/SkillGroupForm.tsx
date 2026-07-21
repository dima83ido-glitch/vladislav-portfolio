"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { createSkillGroup, updateSkillGroup } from "@/lib/cms/content/actions";
import type { Skill, SkillGroup } from "@/db/schema";

const LOCALES = ["en", "uk", "ru"] as const;

type GroupWithSkills = SkillGroup & { skills: Skill[] };

export function SkillGroupForm({ group }: { group?: GroupWithSkills }) {
  const router = useRouter();
  const t = useTranslations("admin.content.skills");
  const commonT = useTranslations("admin.common");

  const [category, setCategory] = useState({
    en: group?.category.en ?? "",
    uk: group?.category.uk ?? "",
    ru: group?.category.ru ?? "",
  });
  const [sortOrder, setSortOrder] = useState(group?.sortOrder ?? 0);
  const [skills, setSkills] = useState(
    group?.skills.length
      ? group.skills.map((s) => ({ name: s.name, level: s.level, sortOrder: s.sortOrder }))
      : [{ name: "", level: 80, sortOrder: 0 }]
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);

    const payload = { category, sortOrder, skills: skills.filter((s) => s.name.trim()) };
    const result = group ? await updateSkillGroup(group.id, payload) : await createSkillGroup(payload);
    setIsPending(false);

    if (!result.ok) {
      setError(t("errorCheckFields"));
      return;
    }

    router.push("/admin/content/skills");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("category")}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {LOCALES.map((locale) => (
            <input
              key={locale}
              value={category[locale]}
              onChange={(e) => setCategory((prev) => ({ ...prev, [locale]: e.target.value }))}
              placeholder={locale.toUpperCase()}
              className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted">{commonT("sortOrder")}</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-24 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-foreground">{t("title")}</span>
        {skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              value={skill.name}
              onChange={(e) => setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, name: e.target.value } : s)))}
              placeholder="React / Next.js"
              className="flex-1 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={skill.level}
              onChange={(e) =>
                setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, level: Number(e.target.value) } : s)))
              }
              className="w-20 rounded-xl border border-line-strong bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
            />
            <button
              type="button"
              onClick={() => setSkills((prev) => prev.filter((_, idx) => idx !== i))}
              className="text-muted transition-colors hover:text-red-400"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSkills((prev) => [...prev, { name: "", level: 80, sortOrder: prev.length }])}
          className="flex w-fit items-center gap-2 text-sm font-medium text-blue-soft transition-colors hover:text-blue-soft/80"
        >
          <FiPlus size={14} /> {t("addSkill")}
        </button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-blue-soft disabled:opacity-50"
      >
        {isPending ? commonT("saving") : group ? commonT("saveChanges") : t("create")}
      </button>
    </form>
  );
}
