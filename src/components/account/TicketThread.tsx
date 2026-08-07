"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { replyToTicket } from "@/lib/support/actions";
import { UserAvatar } from "@/components/shared/UserAvatar";

type MessageRow = {
  message: { id: string; body: string; createdAt: Date };
  author: {
    email: string;
    displayName: string | null;
    role: "admin" | "customer";
    avatarUrl?: string | null;
    avatarEmoji?: string | null;
  };
};

export function TicketThread({
  ticketId,
  messages,
  isClosed,
}: {
  ticketId: string;
  messages: MessageRow[];
  isClosed: boolean;
}) {
  const t = useTranslations("account.support.thread");
  const errorT = useTranslations("account.support.errors");
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !body.trim()) return;

    setIsPending(true);
    setError(null);
    const result = await replyToTicket({ ticketId, body });
    setIsPending(false);

    if (!result.ok) {
      setError(errorT(result.error));
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        {messages.map(({ message, author }) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${author.role === "admin" ? "flex-row-reverse" : ""}`}
          >
            <UserAvatar
              user={author}
              size={32}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-soft/10 text-xs font-bold text-blue-soft"
            />
            <div className={`flex max-w-[80%] flex-col gap-1 ${author.role === "admin" ? "items-end" : ""}`}>
              <span className="text-xs font-medium text-muted">
                {author.displayName || author.email}
              </span>
              <p
                className={`rounded-2xl px-4 py-2.5 text-sm ${
                  author.role === "admin"
                    ? "bg-blue-soft/15 text-foreground"
                    : "bg-line/40 text-foreground/90"
                }`}
              >
                {message.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isClosed ? (
        <p className="text-sm text-muted">{t("closed")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("replyPlaceholder")}
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
      )}
    </div>
  );
}
