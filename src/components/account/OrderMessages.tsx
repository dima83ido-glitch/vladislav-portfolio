"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { postOrderMessage } from "@/lib/orders/actions";
import { initials } from "@/lib/utils";

type MessageRow = {
  message: { id: string; body: string; createdAt: Date };
  author: { email: string; displayName: string | null };
};

export function OrderMessages({
  orderId,
  messages,
  currentUserEmail,
}: {
  orderId: string;
  messages: MessageRow[];
  currentUserEmail: string;
}) {
  const t = useTranslations("account.orders.detail");
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !body.trim()) return;

    setIsPending(true);
    setError(null);
    const result = await postOrderMessage({ orderId, body });
    setIsPending(false);

    if (!result.ok) {
      setError(t(`errors.${result.error}`));
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/50 p-6">
      <span className="text-sm font-semibold text-foreground">{t("messagesTitle")}</span>

      <div className="flex flex-col gap-4">
        {messages.map(({ message, author }) => (
          <div key={message.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-soft/10 text-xs font-bold text-blue-soft">
              {initials(author)}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">
                {author.email === currentUserEmail ? "" : author.displayName || author.email}
              </span>
              <p className="rounded-2xl bg-line/40 px-4 py-2.5 text-sm text-foreground/90">
                {message.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="flex-1 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
        />
        <MagneticButton
          as="button"
          type="submit"
          disabled={isPending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
        >
          {t("send")}
        </MagneticButton>
      </form>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
