"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { updateProfile } from "@/lib/account/actions";

export function ProfileEditForm({
  initialDisplayName,
  initialUsername,
}: {
  initialDisplayName: string | null;
  initialUsername: string | null;
}) {
  const t = useTranslations("account.profile");
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [username, setUsername] = useState(initialUsername ?? "");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setMessage(null);

    const result = await updateProfile({ displayName, username });
    setIsPending(false);

    if (!result.ok) {
      setMessage({ type: "error", text: t(`errors.${result.error}`) });
      return;
    }

    setMessage({ type: "success", text: t("edit.success") });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("displayName")}
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          placeholder={t("edit.displayNamePlaceholder")}
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("username")}
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          maxLength={24}
          placeholder={t("edit.usernamePlaceholder")}
          className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
        />
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <MagneticButton
          as="button"
          type="submit"
          disabled={isPending}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
        >
          {isPending ? t("edit.saving") : t("edit.save")}
        </MagneticButton>
        {message ? (
          <span
            className={`text-sm ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}
          >
            {message.text}
          </span>
        ) : null}
      </div>
    </form>
  );
}
