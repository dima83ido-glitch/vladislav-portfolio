"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiStar } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { Review } from "@/db/schema";
import { approveReview, deleteReview, rejectReview, updateReview } from "@/lib/reviews/actions";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

export function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<void>) {
    setPendingId(id);
    try {
      await action();
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (reviews.length === 0) {
    return <p className="py-12 text-center text-sm text-muted">{t("reviews.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => {
        const isBusy = pendingId === review.id;
        const isEditing = editingId === review.id;

        return (
          <div
            key={review.id}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{review.authorName}</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      STATUS_STYLES[review.status]
                    )}
                  >
                    {t(`reviews.tabs.${review.status}`)}
                  </span>
                </div>
                <span className="text-xs text-muted">{review.authorEmail}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-soft">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>

            {isEditing ? (
              <EditForm
                review={review}
                disabled={isBusy}
                onCancel={() => setEditingId(null)}
                onSave={async (data) => {
                  await run(review.id, () => updateReview(review.id, data));
                  setEditingId(null);
                }}
              />
            ) : (
              <p className="text-sm leading-relaxed text-foreground/80">{review.body}</p>
            )}

            {!isEditing ? (
              <div className="flex flex-wrap gap-3 border-t border-line pt-4 text-sm">
                {review.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => run(review.id, () => approveReview(review.id))}
                    className="font-medium text-emerald-400 transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {t("common.approve")}
                  </button>
                ) : null}
                {review.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => run(review.id, () => rejectReview(review.id))}
                    className="font-medium text-amber-400 transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {t("common.reject")}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setEditingId(review.id)}
                  className="font-medium text-muted transition-colors hover:text-foreground disabled:opacity-40"
                >
                  {t("common.edit")}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    if (confirm(t("reviews.confirmDelete"))) {
                      run(review.id, () => deleteReview(review.id));
                    }
                  }}
                  className="font-medium text-red-400 transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {t("common.delete")}
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function EditForm({
  review,
  disabled,
  onCancel,
  onSave,
}: {
  review: Review;
  disabled: boolean;
  onCancel: () => void;
  onSave: (data: { authorName: string; body: string; rating: number }) => void;
}) {
  const t = useTranslations("admin.common");
  const [authorName, setAuthorName] = useState(review.authorName);
  const [body, setBody] = useState(review.body);
  const [rating, setRating] = useState(review.rating);

  return (
    <div className="flex flex-col gap-3">
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        className="rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="resize-none rounded-xl border border-line-strong bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-blue-soft"
      />
      <div className="flex items-center gap-1 text-blue-soft">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button key={value} type="button" onClick={() => setRating(value)} className="p-0.5">
              <FiStar size={18} fill={value <= rating ? "currentColor" : "none"} />
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 text-sm">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSave({ authorName, body, rating })}
          className="font-medium text-blue-soft transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {t("save")}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onCancel}
          className="font-medium text-muted transition-colors hover:text-foreground"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
