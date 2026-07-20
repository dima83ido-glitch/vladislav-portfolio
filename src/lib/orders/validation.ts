import { z } from "zod";

export const orderMessageSchema = z.object({
  orderId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});
