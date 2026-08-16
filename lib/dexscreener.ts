export interface DexPair {
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd: string;
  fdv?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { m5?: number; h1?: number; h24?: number };
  pairCreatedAt?: number;
  chainId: string;
  url: string;
}

const SEARCH_URL = "https://api.dexscreener.com/latest/dex/search";

/**
 * Pull currently-trending pairs on Robinhood Chain. DexScreener doesn't
 * expose a pure "trending" endpoint publicly, so we search a high-liquidity
 * quote asset (WETH) and sort what comes back by 24h volume. Robinhood
 * Chain's chainId slug on DexScreener is "robinhood".
 */
export async function fetchRobinhoodPairs(query = "WETH"): Promise<DexPair[]> {
  const res = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DexScreener error: ${res.status}`);
  const data = await res.json();
  const pairs: DexPair[] = data.pairs ?? [];
  return pairs
    .filter((p) => p.chainId === "robinhood")
    .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0));
}
