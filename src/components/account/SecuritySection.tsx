"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { signOutEverywhere } from "@/lib/account/actions";
import { changePassword, requestPasswordReset, resetPassword } from "@/lib/auth/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password.constants";

type Mode = "idle" | "change" | "reset";

export function SecuritySection({ email }: { email: string }) {
  const t = useTranslations("account.profile.security");
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  const [mode, setMode] = useState<Mode>("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset password
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");

  function closeForms() {
    setMode("idle");
    setResetStep("request");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setCode("");
    setErrorKey(null);
  }

  async function handleSignOutEverywhere() {
    if (isPending) return;
    setIsPending(true);
    await signOutEverywhere();
    setIsPending(false);
    setDone(true);
  }

  async function handleChangeSubmit() {
    if (isPending) return;
    setErrorKey(null);
    setIsPending(true);
    const result = await changePassword(currentPassword, newPassword, confirmPassword);
    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setSuccessMessage(t("changeForm.success"));
    closeForms();
  }

  async function handleStartReset() {
    if (isPending) return;
    setErrorKey(null);
    setIsPending(true);
    const result = await requestPasswordReset();
    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setMode("reset");
    setResetStep("verify");
  }

  async function handleResetSubmit() {
    if (isPending) return;
    setErrorKey(null);
    setIsPending(true);
    const result = await resetPassword(code, newPassword, confirmPassword);
    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setSuccessMessage(t("resetForm.success"));
    closeForms();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/50 p-6">
      <span className="text-sm font-semibold text-foreground">{t("title")}</span>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("emailLabel")}
        </span>
        <span className="text-sm text-foreground">{email}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {t("passwordLabel")}
          </span>
          <span className="text-sm tracking-widest text-foreground">••••••••••</span>
        </div>
        {mode === "idle" ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("change")}
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
            >
              {t("changePassword")}
            </button>
            <button
              type="button"
              onClick={handleStartReset}
              disabled={isPending}
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft disabled:opacity-50"
            >
              {t("resetPassword")}
            </button>
          </div>
        ) : null}
      </div>

      {mode === "change" ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t("changeForm.currentPasswordLabel")}
            autoComplete="current-password"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("changeForm.newPasswordLabel")}
            autoComplete="new-password"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("changeForm.confirmPasswordLabel")}
            autoComplete="new-password"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
          {errorKey ? <p className="text-sm text-red-400">{t(`errors.${errorKey}`)}</p> : null}
          <div className="flex gap-3">
            <MagneticButton
              as="button"
              onClick={() => {
                if (newPassword.length < PASSWORD_MIN_LENGTH) {
                  setErrorKey("invalidPassword");
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setErrorKey("passwordMismatch");
                  return;
                }
                handleChangeSubmit();
              }}
              disabled={isPending}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
            >
              {isPending ? t("changeForm.submitting") : t("changeForm.submit")}
            </MagneticButton>
            <button
              type="button"
              onClick={closeForms}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : null}

      {mode === "reset" && resetStep === "verify" ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <p className="text-sm text-muted">{t("resetForm.sentDescription", { email })}</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder={t("resetForm.codePlaceholder")}
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-center text-lg font-bold tracking-[0.3em] text-foreground outline-none focus:border-blue-soft"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("resetForm.newPasswordLabel")}
            autoComplete="new-password"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("resetForm.confirmPasswordLabel")}
            autoComplete="new-password"
            className="rounded-xl border border-line-strong bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-soft"
          />
          {errorKey ? <p className="text-sm text-red-400">{t(`errors.${errorKey}`)}</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            <MagneticButton
              as="button"
              onClick={() => {
                if (newPassword.length < PASSWORD_MIN_LENGTH) {
                  setErrorKey("invalidPassword");
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setErrorKey("passwordMismatch");
                  return;
                }
                handleResetSubmit();
              }}
              disabled={isPending}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
            >
              {isPending ? t("resetForm.submitting") : t("resetForm.submit")}
            </MagneticButton>
            <button
              type="button"
              onClick={handleStartReset}
              disabled={isPending}
              className="text-sm font-medium text-muted transition-colors hover:text-blue-soft disabled:opacity-50"
            >
              {t("resetForm.resend")}
            </button>
            <button
              type="button"
              onClick={closeForms}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : null}

      {successMessage ? <p className="text-sm text-emerald-400">{successMessage}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-foreground/85">{t("signOutEverywhere")}</span>
          <span className="text-xs text-muted">{t("signOutEverywhereDescription")}</span>
        </div>
        <MagneticButton
          as="button"
          onClick={handleSignOutEverywhere}
          disabled={isPending}
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft"
        >
          {t("signOutEverywhere")}
        </MagneticButton>
      </div>
      {done ? <p className="text-sm text-emerald-400">{t("done")}</p> : null}
    </div>
  );
}
