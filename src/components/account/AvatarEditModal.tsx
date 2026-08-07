"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiRotateCcw, FiUpload, FiX } from "react-icons/fi";
import { removeAvatar, updateAvatarEmoji, uploadAvatarImage } from "@/lib/account/actions";
import { ALLOWED_AVATAR_MIME, AVATAR_MAX_BYTES, BUILTIN_AVATARS } from "@/lib/account/avatar";
import type { AvatarUser } from "@/components/shared/UserAvatar";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/utils";

type ErrorKey =
  | "invalid"
  | "notConfigured"
  | "tooLarge"
  | "unsupportedFormat"
  | "broken"
  | "rateLimited"
  | "generic";

export function AvatarEditModal({
  user,
  isOpen,
  onClose,
}: {
  user: AvatarUser;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("account.profile.avatar");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [tab, setTab] = useState<"builtin" | "upload">("builtin");
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) return;
    setTab("builtin");
    setPendingEmoji(null);
    setFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    setIsSubmitting(false);
    setProgress(0);
    setIsSuccess(false);
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  // Server Actions called directly (this project's existing upload pattern —
  // see ProjectForm.tsx) don't expose real byte-level progress events, so
  // this eases toward 90% while the request is in flight and snaps to 100%
  // on response, rather than showing a static "Uploading…" with no motion.
  function startFakeProgress() {
    setProgress(8);
    progressTimer.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + Math.max(1, (90 - prev) * 0.12) : prev));
    }, 180);
  }

  function stopFakeProgress() {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }

  function finishWithSuccess() {
    stopFakeProgress();
    setProgress(100);
    setIsSubmitting(false);
    setIsSuccess(true);
    router.refresh();
    setTimeout(onClose, 900);
  }

  async function handleEmojiSelect(emoji: string) {
    if (isSubmitting) return;
    setError(null);
    setPendingEmoji(emoji);
    setIsSubmitting(true);

    const result = await updateAvatarEmoji(emoji);

    if (!result.ok) {
      setIsSubmitting(false);
      setPendingEmoji(null);
      setError(result.error);
      return;
    }

    finishWithSuccess();
  }

  function validateFile(candidate: File): ErrorKey | null {
    if (candidate.size > AVATAR_MAX_BYTES) return "tooLarge";
    if (!(ALLOWED_AVATAR_MIME as readonly string[]).includes(candidate.type)) return "unsupportedFormat";
    return null;
  }

  function pickFile(candidate: File) {
    const validationError = validateFile(candidate);
    setError(validationError);
    if (validationError) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const candidate = event.target.files?.[0];
    if (candidate) pickFile(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const candidate = event.dataTransfer.files?.[0];
    if (candidate) pickFile(candidate);
  }

  async function handleUpload() {
    if (!file || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    startFakeProgress();

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadAvatarImage(formData);

    if (!result.ok) {
      stopFakeProgress();
      setProgress(0);
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    finishWithSuccess();
  }

  async function handleReset() {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const result = await removeAvatar();

    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    finishWithSuccess();
  }

  const hasCustomAvatar = Boolean(user.avatarUrl || user.avatarEmoji);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-background/85 backdrop-blur-md"
            onClick={onClose}
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-line-strong bg-surface p-6 shadow-2xl shadow-black/50 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{t("modalTitle")}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("close")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-line/60 hover:text-foreground"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-line-strong bg-background p-1">
                {(["builtin", "upload"] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => {
                      setTab(tabKey);
                      setError(null);
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      tab === tabKey ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                    )}
                  >
                    {t(`tabs.${tabKey}`)}
                  </button>
                ))}
              </div>

              <div className="relative mt-6 min-h-[220px]">
                <AnimatePresence>
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
                      >
                        <FiCheck size={26} />
                      </motion.span>
                      <span className="text-sm font-semibold text-foreground">{t("success")}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {tab === "builtin" ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-muted">{t("builtinHint")}</p>
                    <div className="grid grid-cols-5 gap-3">
                      {BUILTIN_AVATARS.map((emoji) => {
                        const isSelected = user.avatarEmoji === emoji;
                        const isPendingThis = isSubmitting && pendingEmoji === emoji;
                        return (
                          <motion.button
                            key={emoji}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleEmojiSelect(emoji)}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.96 }}
                            className={cn(
                              "flex aspect-square items-center justify-center rounded-2xl border bg-gradient-to-br from-blue-soft/10 to-blue/5 text-2xl transition-colors",
                              isSelected
                                ? "border-blue-soft ring-2 ring-blue-soft/40"
                                : "border-line-strong hover:border-blue-soft",
                              isSubmitting && !isPendingThis && "opacity-60"
                            )}
                          >
                            {isPendingThis ? (
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="h-4 w-4 rounded-full border-2 border-blue-soft border-t-transparent"
                              />
                            ) : (
                              emoji
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                        isDragging ? "border-blue-soft bg-blue-soft/5" : "border-line-strong hover:border-blue-soft"
                      )}
                      data-cursor-pointer
                    >
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-soft/10 text-blue-soft">
                          <FiUpload size={20} />
                        </span>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {previewUrl ? t("changeFile") : t("uploadHint")}
                      </span>
                      <span className="text-xs text-muted">{t("uploadFormats")}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>

                    {isSubmitting ? (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
                        <motion.div
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "easeOut" }}
                          className="h-full rounded-full bg-blue-soft"
                        />
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!file || isSubmitting}
                      className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft disabled:opacity-50"
                    >
                      {isSubmitting ? t("uploading") : t("uploadButton")}
                    </button>
                  </div>
                )}
              </div>

              {error ? <p className="mt-4 text-sm text-red-400">{t(`errors.${error}`)}</p> : null}

              {hasCustomAvatar ? (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="mt-6 flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <FiRotateCcw size={13} />
                  {t("resetButton")}
                </button>
              ) : null}
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
