"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { GlowBackground } from "@/components/ui/GlowBackground";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Link } from "@/i18n/navigation";
import { requestCode, verifyCode } from "@/lib/auth/actions";

type Step = "email" | "code";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const t = useTranslations("auth");
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  async function handleSendCode() {
    if (isPending) return;
    setErrorKey(null);
    setIsPending(true);
    const result = await requestCode(email);
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
    const result = await verifyCode(email, code);
    setIsPending(false);

    if (!result.ok) {
      setErrorKey(result.error);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleSendCode();
  }

  function handleCodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleVerify();
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/60 p-8 sm:p-10">
      <GlowBackground variant="section" />

      <div className="relative">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors hover:text-blue-soft"
        >
          <FiArrowLeft size={13} />
          {t("backToHome")}
        </Link>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {t("title")}
                </h1>
                <p className="text-sm leading-relaxed text-muted">{t("subtitle")}</p>
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
                  onKeyDown={handleEmailKeyDown}
                  placeholder={t("emailPlaceholder")}
                  className="rounded-xl border border-line-strong bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
                />
              </div>

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
                    setStep("email");
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
