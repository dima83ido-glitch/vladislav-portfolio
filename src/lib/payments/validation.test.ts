import { describe, expect, it } from "vitest";
import { cryptoPaymentSchema } from "./validation";

const validInput = {
  orderId: "123e4567-e89b-12d3-a456-426614174000",
  currency: "USDT_TRC20",
  txHash: "abc123def456",
};

describe("cryptoPaymentSchema", () => {
  it("accepts a valid submission", () => {
    expect(cryptoPaymentSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a non-uuid orderId", () => {
    expect(cryptoPaymentSchema.safeParse({ ...validInput, orderId: "not-a-uuid" }).success).toBe(
      false
    );
  });

  it("rejects an unsupported currency", () => {
    expect(cryptoPaymentSchema.safeParse({ ...validInput, currency: "DOGE" }).success).toBe(
      false
    );
  });

  it("rejects a tx hash that's too short", () => {
    expect(cryptoPaymentSchema.safeParse({ ...validInput, txHash: "abc" }).success).toBe(false);
  });

  it("accepts every supported currency", () => {
    for (const currency of ["BTC", "ETH", "USDT_TRC20", "USDT_ERC20", "TON", "SOL"]) {
      expect(cryptoPaymentSchema.safeParse({ ...validInput, currency }).success).toBe(true);
    }
  });
});
