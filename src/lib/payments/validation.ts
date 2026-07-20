import { z } from "zod";

export const cryptoPaymentSchema = z.object({
  orderId: z.string().uuid(),
  currency: z.enum(["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "TON", "SOL"]),
  txHash: z.string().trim().min(6).max(200),
});
