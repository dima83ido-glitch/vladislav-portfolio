"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orderMessages, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { notifyAdmins, notifyUser } from "@/db/queries/notifications";
import { orderMessageSchema } from "./validation";

const MESSAGE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MESSAGE_RATE_LIMIT = 20;

export async function postOrderMessage(
  input: unknown
): Promise<
  { ok: true } | { ok: false; error: "invalid" | "forbidden" | "rateLimited" | "generic" }
> {
  const session = await requireUser().catch(() => null);
  if (!session) {
    return { ok: false, error: "invalid" };
  }

  const parsed = orderMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  const isAdmin = session.user.role === "admin";
  const db = getDb();
  const [order] = await db
    .select({ userId: orders.userId })
    .from(orders)
    .where(eq(orders.id, parsed.data.orderId))
    .limit(1);

  if (!order || (!isAdmin && order.userId !== session.user.id)) {
    return { ok: false, error: "forbidden" };
  }

  const { limited } = await checkRateLimit(
    `order-message:${session.user.id}`,
    MESSAGE_RATE_LIMIT,
    MESSAGE_RATE_LIMIT_WINDOW_MS
  );
  if (limited) {
    return { ok: false, error: "rateLimited" };
  }

  try {
    await db.insert(orderMessages).values({
      orderId: parsed.data.orderId,
      authorId: session.user.id,
      body: parsed.data.body,
    });

    if (isAdmin) {
      await notifyUser(order.userId, "orders", "order_message", parsed.data.orderId);
    } else {
      await notifyAdmins("orders", "order_message", parsed.data.orderId, session.user.id);
    }

    revalidatePath(`/account/orders/${parsed.data.orderId}`);
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);

    return { ok: true };
  } catch (error) {
    console.error("Failed to post order message:", error);
    return { ok: false, error: "generic" };
  }
}
