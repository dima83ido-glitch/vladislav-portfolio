"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { createTicket } from "@/lib/support/actions";

export function NewTicketForm() {
  const t = useTranslations("account.support");
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);

    const result = await createTicket({ subject, body });
    setIsPending(false);

    if (!result.ok) {
      setError(t(`errors.${result.error}`));
      return;
    }

    router.push(`/account/support/${result.ticketId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border border-line bg-surface/60 p-8">
      <h1 className="text-xl font-bold text-foreground">{t("new.title")}</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("new.subjectLabel")}
        </label>
        <input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          minLength={4}
          maxLength={150}
          placeholder={t("new.subjectPlaceholder")}
          className="rounded-xl border border-line-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("new.bodyLabel")}
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          placeholder={t("new.bodyPlaceholder")}
          className="resize-none rounded-xl border border-line-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <MagneticButton
        as="button"
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
      >
        {t("new.submit")}
      </MagneticButton>
    </form>
  );
}
