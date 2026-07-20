"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { closeTicket, replyToTicket } from "@/lib/support/actions";

type MessageRow = {
  message: { id: string; body: string; createdAt: Date };
  author: { email: string; displayName: string | null; role: "admin" | "customer" };
};

export function AdminTicketThread({
  ticketId,
  messages,
  isClosed,
}: {
  ticketId: string;
  messages: MessageRow[];
  isClosed: boolean;
}) {
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !body.trim()) return;

    setIsPending(true);
    const result = await replyToTicket({ ticketId, body });
    setIsPending(false);

    if (result.ok) {
      setBody("");
      router.refresh();
    }
  }

  async function handleClose() {
    setIsPending(true);
    await closeTicket(ticketId);
    setIsPending(false);
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-soft/10 text-xs font-bold text-blue-soft">
              {(author.displayName || author.email).slice(0, 2).toUpperCase()}
            </span>
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
        <p className="text-sm text-muted">This ticket is closed.</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft disabled:opacity-50"
            >
              Send
            </button>
          </form>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="w-fit text-sm font-medium text-muted transition-colors hover:text-red-400"
          >
            Close ticket
          </button>
        </>
      )}
    </div>
  );
}
