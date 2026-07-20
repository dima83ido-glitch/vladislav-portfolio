"use client";

import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { useTranslations } from "next-intl";
import { FiCheck, FiCopy } from "react-icons/fi";
import { useRouter } from "@/i18n/navigation";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { submitCryptoPayment } from "@/lib/payments/actions";
import { CRYPTO_CURRENCIES, type CryptoCurrency } from "@/lib/payments/crypto";
import { cn } from "@/lib/utils";

export function CryptoPaymentForm({ orderId }: { orderId: string }) {
  const t = useTranslations("account.orders.payment.crypto");
  const router = useRouter();

  const [currency, setCurrency] = useState<CryptoCurrency>("USDT_TRC20");
  const [txHash, setTxHash] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = CRYPTO_CURRENCIES.find((c) => c.id === currency)!;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(selected.address, { margin: 1, width: 200 }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [selected.address]);

  async function handleCopy() {
    await navigator.clipboard.writeText(selected.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    setError(null);

    const result = await submitCryptoPayment({ orderId, currency, txHash });
    setIsPending(false);

    if (!result.ok) {
      setError(t(`errors.${result.error}`));
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => router.push(`/account/orders/${orderId}`), 1800);
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface/60 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <FiCheck size={22} />
        </span>
        <p className="text-sm font-medium text-foreground">{t("success")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface/60 p-8">
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {t("selectCurrency")}
        </span>
        <div className="flex flex-wrap gap-2">
          {CRYPTO_CURRENCIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrency(c.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                currency === c.id
                  ? "border-blue-soft bg-blue-soft/10 text-blue-soft"
                  : "border-line-strong text-foreground/80 hover:border-blue-soft/50"
              )}
            >
              {c.label} <span className="text-xs text-muted">({c.network})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-background p-6 sm:flex-row sm:items-start">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`${selected.label} address QR code`} width={140} height={140} className="rounded-lg" />
        ) : (
          <div className="h-[140px] w-[140px] shrink-0 rounded-lg bg-line/40" />
        )}
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {t("address")}
          </span>
          <code className="break-all rounded-lg bg-line/40 px-3 py-2 text-xs text-foreground/90">
            {selected.address}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-fit items-center gap-2 text-sm font-medium text-blue-soft transition-colors hover:text-blue-soft/80"
          >
            {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>

      <p className="text-sm text-muted">{t("instructions")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="txHash" className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
            {t("txHashLabel")}
          </label>
          <input
            id="txHash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            required
            minLength={6}
            maxLength={200}
            placeholder={t("txHashPlaceholder")}
            className="rounded-xl border border-line-strong bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-blue-soft"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <MagneticButton
          as="button"
          type="submit"
          disabled={isPending}
          className="w-fit rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-blue-soft"
        >
          {isPending ? t("submitting") : t("submit")}
        </MagneticButton>
      </form>
    </div>
  );
}
