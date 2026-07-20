"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FiStar, FiX } from "react-icons/fi";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { submitReview } from "@/lib/reviews/actions";

export function ReviewsWriteButton() {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  function close() {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setErrorKey(null);
      setRating(5);
      setHoverRating(0);
    }, 300);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setErrorKey(null);
    setIsPending(true);

    const result = await submitReview({
      authorName: String(formData.get("authorName") ?? ""),
      authorEmail: String(formData.get("authorEmail") ?? ""),
      rating,
      body: String(formData.get("body") ?? ""),
      locale,
      website: String(formData.get("website") ?? ""),
    });

    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }

    setIsSubmitted(true);
  }

  return (
    <>
      <MagneticButton
        as="button"
        onClick={() => setIsOpen(true)}
        className="group rounded-full border border-line-strong px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
      >
        {t("writeReview")}
      </MagneticButton>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-8 sm:p-9"
            >
              <button
                type="button"
                aria-label={t("form.cancel")}
                onClick={close}
                className="absolute right-6 top-6 text-muted transition-colors hover:text-foreground"
              >
                <FiX size={20} />
              </button>

              {isSubmitted ? (
                <div className="flex flex-col gap-4 py-6 text-center">
                  <p className="text-lg font-semibold text-foreground">{t("success")}</p>
                  <MagneticButton
                    as="button"
                    onClick={close}
                    className="mx-auto rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
                  >
                    {t("form.cancel")}
                  </MagneticButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="text-xl font-bold text-foreground">{t("form.title")}</h3>

                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                  />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="authorName" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                      {t("form.nameLabel")}
                    </label>
                    <input
                      id="authorName"
                      name="authorName"
                      type="text"
                      required
                      minLength={2}
                      maxLength={80}
                      placeholder={t("form.namePlaceholder")}
                      className="rounded-xl border border-line-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="authorEmail" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                      {t("form.emailLabel")}
                    </label>
                    <input
                      id="authorEmail"
                      name="authorEmail"
                      type="email"
                      required
                      placeholder={t("form.emailPlaceholder")}
                      className="rounded-xl border border-line-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                    />
                    <p className="text-xs text-muted">{t("form.emailHint")}</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                      {t("form.ratingLabel")}
                    </span>
                    <div className="flex items-center gap-1 text-blue-soft">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const value = i + 1;
                        const filled = value <= (hoverRating || rating);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(0)}
                            aria-label={`${value}`}
                            className="p-0.5"
                          >
                            <FiStar size={22} fill={filled ? "currentColor" : "none"} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="body" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                      {t("form.messageLabel")}
                    </label>
                    <textarea
                      id="body"
                      name="body"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      placeholder={t("form.messagePlaceholder")}
                      className="resize-none rounded-xl border border-line-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                    />
                  </div>

                  {errorKey ? (
                    <p className="text-sm text-red-400">{t(`errors.${errorKey}`)}</p>
                  ) : null}

                  <MagneticButton
                    as="button"
                    type="submit"
                    disabled={isPending}
                    className="w-full justify-center rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
                  >
                    {isPending ? t("form.submitting") : t("form.submit")}
                  </MagneticButton>
                </form>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
