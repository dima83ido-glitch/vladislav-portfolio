"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { BackButton } from "@/components/ui/BackButton";
import { HomeButton } from "@/components/ui/HomeButton";
import {
  loginRequestCode,
  loginVerifyCode,
  registerRequestCode,
  registerVerifyCode,
} from "@/lib/auth/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/password.constants";

type Step = "credentials" | "code";

export function LoginForm({
  callbackUrl,
  isRegister = false,
}: {
  callbackUrl: string;
  isRegister?: boolean;
}) {
  const t = useTranslations("auth");
  const commonT = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function handleSendCode() {
    if (isPending) return;
    setErrorKey(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setErrorKey("invalidPassword");
      return;
    }
    if (isRegister && password !== confirmPassword) {
      setErrorKey("passwordMismatch");
      return;
    }

    setIsPending(true);
    const result = isRegister
      ? await registerRequestCode(email, password, confirmPassword)
      : await loginRequestCode(email, password);
    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }
    setStep("code");
  }

  async function handleVerify() {
    if (isPending) return;
    setErrorKey(null);
    setIsPending(true);
    const result = isRegister
      ? await registerVerifyCode(email, code, password, rememberMe)
      : await loginVerifyCode(email, code, password, rememberMe);
    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function handleCredentialsKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleSendCode();
  }

  function handleCodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleVerify();
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 p-8 sm:p-10">
      <GlowBackground variant="section" />

      <div className="relative">
        <div className="mb-8 flex items-center gap-4">
          <BackButton label={commonT("back")} />
          <HomeButton label={commonT("home")} />
        </div>

        <AnimatePresence mode="wait">
          {step === "credentials" ? (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {isRegister ? t("registerTitle") : t("title")}
                </h1>
                <p className="text-sm leading-relaxed text-muted">
                  {isRegister ? t("registerSubtitle") : t("subtitle")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                  {t("emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleCredentialsKeyDown}
                  placeholder={t("emailPlaceholder")}
                  className="rounded-xl border border-line-strong bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                  {t("passwordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleCredentialsKeyDown}
                  placeholder={t("passwordPlaceholder")}
                  className="rounded-xl border border-line-strong bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                />
              </div>

              {isRegister ? (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium uppercase tracking-[0.15em] text-muted"
                  >
                    {t("confirmPasswordLabel")}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleCredentialsKeyDown}
                    placeholder={t("confirmPasswordPlaceholder")}
                    className="rounded-xl border border-line-strong bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                  />
                </div>
              ) : null}

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-line-strong bg-background text-blue-soft accent-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-soft"
                />
                {t("rememberMe")}
              </label>

              {errorKey ? (
                <p className="text-sm text-red-400">{t(`errors.${errorKey}`)}</p>
              ) : null}

              <MagneticButton
                as="button"
                onClick={handleSendCode}
                disabled={isPending}
                className="group w-full justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
              >
                {isPending ? t("sending") : t("sendCode")}
                <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </MagneticButton>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {t("codeSentTitle")}
                </h1>
                <p className="text-sm leading-relaxed text-muted">
                  {t("codeSentSubtitle", { email })}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                  {t("codeLabel")}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={handleCodeKeyDown}
                  placeholder={t("codePlaceholder")}
                  className="rounded-xl border border-line-strong bg-background px-4 py-3.5 text-center text-2xl font-bold tracking-[0.4em] text-foreground outline-none transition-colors focus:border-blue-soft"
                />
              </div>

              {errorKey ? (
                <p className="text-sm text-red-400">{t(`errors.${errorKey}`)}</p>
              ) : null}

              <MagneticButton
                as="button"
                onClick={handleVerify}
                disabled={isPending}
                className="group w-full justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
              >
                {isPending ? t("verifying") : t("verify")}
                <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </MagneticButton>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setCode("");
                    setErrorKey(null);
                  }}
                  className="text-muted transition-colors hover:text-blue-soft"
                >
                  {t("changeEmail")}
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-muted transition-colors hover:text-blue-soft"
                >
                  {t("resend")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
