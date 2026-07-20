import { Resend } from "resend";

let client: Resend | undefined;

function getClient() {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(apiKey);
  }
  return client;
}

/**
 * Sends a transactional email, or — when RESEND_API_KEY isn't configured
 * outside production — logs it to the console instead so local flows are
 * still fully testable. In production a missing key or from-address always
 * throws, and the Resend SDK's { error } response (it does NOT throw on
 * API-level failures like an unverified sending domain) is always checked
 * and surfaced rather than silently swallowed.
 */
async function sendTransactionalEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(`[dev] Email to ${params.to} — ${params.subject}\n${params.html}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not set");
  }

  const { error } = await getClient().emails.send({ from, ...params });

  if (error) {
    throw new Error(`Resend rejected the email (${error.name}): ${error.message}`);
  }
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  await sendTransactionalEmail({
    to: email,
    subject: "Your verification code",
    html: `<div style="font-family:sans-serif;padding:24px;color:#111"><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0;">${code}</p><p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p></div>`,
  });
}

export async function sendOrderPaidEmail(email: string, orderTitle: string) {
  await sendTransactionalEmail({
    to: email,
    subject: "Payment confirmed",
    html: `<div style="font-family:sans-serif;padding:24px;color:#111"><p>Your payment for <strong>${orderTitle}</strong> has been confirmed.</p><p style="color:#666;font-size:13px;">Work will begin shortly — you can follow progress and message directly from your order page.</p></div>`,
  });
}
