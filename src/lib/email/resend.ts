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

export async function sendVerificationCodeEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    // Local/dev fallback: no Resend key configured, so print the code
    // instead of emailing it. The DB write of the hashed code is
    // identical either way — this only affects delivery.
    console.log(`[dev] Verification code for ${email}: ${code}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not set");
  }

  await getClient().emails.send({
    from,
    to: email,
    subject: "Your verification code",
    html: `<div style="font-family:sans-serif;padding:24px;color:#111"><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0;">${code}</p><p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p></div>`,
  });
}
