export type CryptoCurrency = "BTC" | "ETH" | "USDT_TRC20" | "USDT_ERC20" | "TON" | "SOL";

export const CRYPTO_CURRENCIES: {
  id: CryptoCurrency;
  label: string;
  network: string;
  address: string;
}[] = [
  { id: "BTC", label: "Bitcoin", network: "BTC", address: "1FpKE8oqwd2pB6Y4EwgEyVyTJyt4sNobrP" },
  {
    id: "ETH",
    label: "Ethereum",
    network: "ERC20",
    address: "0xaa4bae5c63af2fe1f8b016006bdde54fe9d26398",
  },
  {
    id: "USDT_TRC20",
    label: "USDT",
    network: "TRC20",
    address: "TJZUvkdPmGaaeZnLdMrPYybRHa2Qh5B3Me",
  },
  {
    id: "USDT_ERC20",
    label: "USDT",
    network: "ERC20",
    address: "0xaa4bae5c63af2fe1f8b016006bdde54fe9d26398",
  },
  {
    id: "TON",
    label: "Toncoin",
    network: "TON",
    address: "UQDYTuuWptHiL8ooVIJhXXLgFLgEDgrHodyD1YTlZkEuJTrH",
  },
  {
    id: "SOL",
    label: "Solana",
    network: "SOL",
    address: "GyDcJVHd54i5wzsxRTNWECqtU7osJ2egUpcpyWtYWZob",
  },
];

export function getCryptoCurrency(id: string) {
  return CRYPTO_CURRENCIES.find((c) => c.id === id) ?? null;
}
