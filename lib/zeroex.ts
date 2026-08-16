// 0x Swap API (v2) — aggregates Robinhood Chain liquidity (AMM + RFQ) and
// returns a ready-to-sign transaction. Requires a free API key from
// https://0x.org/. 0x announced Day-1 support for Robinhood Chain
// (chain ID 4663) on 2026-07-01.

const ROBINHOOD_CHAIN_ID = 4663;
const API_URL = "https://api.0x.org/swap/permit2/quote";

export interface SwapQuote {
  buyAmount: string;
  sellAmount: string;
  transaction: {
    to: `0x${string}`;
    data: `0x${string}`;
    value: string;
    gas?: string;
  };
  issues?: unknown;
}

export async function getSwapQuote(params: {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
}): Promise<SwapQuote> {
  const apiKey = process.env.NEXT_PUBLIC_ZEROEX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_ZEROEX_API_KEY. Get a free key at https://0x.org/ and add it to .env.local"
    );
  }

  const qs = new URLSearchParams({
    chainId: String(ROBINHOOD_CHAIN_ID),
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
  });

  const res = await fetch(`${API_URL}?${qs.toString()}`, {
    headers: {
      "0x-api-key": apiKey,
      "0x-version": "v2",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`0x API error ${res.status}: ${body}`);
  }

  return res.json();
}
