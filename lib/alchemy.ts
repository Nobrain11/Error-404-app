// Alchemy Data API — used for two things the free DexScreener API can't do:
// 1. ERC-20 token balances for a wallet (portfolio)
// 2. Recent transfer history for a token contract (trade feed approximation)
//
// Get a free key at https://dashboard.alchemy.com/ — create an app on
// "Robinhood Chain" specifically (Alchemy is Robinhood's recommended
// provider per their docs).

const BASE = () => {
  const key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_ALCHEMY_API_KEY. Get a free key at https://dashboard.alchemy.com/ and add it to .env.local"
    );
  }
  return `https://robinhood-mainnet.g.alchemy.com/v2/${key}`;
};

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(BASE(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export interface TokenBalance {
  contractAddress: string;
  balanceRaw: string; // hex
}

export async function getTokenBalances(address: string): Promise<TokenBalance[]> {
  const result = await rpc("alchemy_getTokenBalances", [address, "erc20"]);
  return (result?.tokenBalances ?? [])
    .filter((t: any) => t.tokenBalance && t.tokenBalance !== "0x0")
    .map((t: any) => ({
      contractAddress: t.contractAddress,
      balanceRaw: t.tokenBalance,
    }));
}

export interface TokenMeta {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
}

export async function getTokenMetadata(contractAddress: string): Promise<TokenMeta> {
  const result = await rpc("alchemy_getTokenMetadata", [contractAddress]);
  return {
    name: result?.name ?? null,
    symbol: result?.symbol ?? null,
    decimals: result?.decimals ?? null,
  };
}

export interface Transfer {
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  timestamp?: string;
}

/**
 * Recent transfers involving a token contract — used as an approximation of
 * a live trade feed (transfers to/from the pair's LP address are swaps).
 * For a true buy/sell-tagged feed, filter `to`/`from` against the specific
 * pair address you get back from DexScreener.
 */
export async function getTokenTransfers(
  contractAddress: string,
  limit = 25
): Promise<Transfer[]> {
  const result = await rpc("alchemy_getAssetTransfers", [
    {
      contractAddresses: [contractAddress],
      category: ["erc20"],
      order: "desc",
      maxCount: `0x${limit.toString(16)}`,
      withMetadata: true,
    },
  ]);
  return (result?.transfers ?? []).map((t: any) => ({
    hash: t.hash,
    from: t.from,
    to: t.to,
    value: t.value,
    asset: t.asset,
    timestamp: t.metadata?.blockTimestamp,
  }));
}
