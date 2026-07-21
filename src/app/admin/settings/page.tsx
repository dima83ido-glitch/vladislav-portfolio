import { isStripeConfigured } from "@/lib/payments/stripe";
import { isCloudinaryConfigured } from "@/lib/media/cloudinary";

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-emerald-500/10 text-emerald-400" : "bg-line/60 text-muted"
      }`}
    >
      {ok ? "Configured" : "Not configured"}
    </span>
  );
}

export default function AdminSettingsPage() {
  const rows = [
    { label: "Database (Neon)", ok: Boolean(process.env.DATABASE_URL) },
    { label: "Email (Resend)", ok: Boolean(process.env.RESEND_API_KEY) },
    { label: "Card payments (Stripe)", ok: isStripeConfigured() },
    { label: "Media storage (Cloudinary)", ok: isCloudinaryConfigured() },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Read-only view of what&apos;s configured. Actual values are never shown here — set or change
          them in Render&apos;s environment variables dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-2xl border border-line bg-surface/60 p-5"
          >
            <span className="text-sm font-medium text-foreground">{row.label}</span>
            <StatusBadge ok={row.ok} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <span className="text-sm font-medium text-foreground">Admin account</span>
        <p className="mt-1 text-xs text-muted">
          Whoever signs in with the email set as ADMIN_EMAIL automatically gets admin access. Only that
          one address can ever reach this dashboard.
        </p>
      </div>
    </div>
  );
}
