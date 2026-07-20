"use client";

export function InvoicePrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-blue-soft hover:text-blue-soft print:hidden"
    >
      {label}
    </button>
  );
}
