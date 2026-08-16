"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import Link from "next/link";
import { getTokenBalances, getTokenMetadata, TokenBalance } from "@/lib/alchemy";

interface Holding {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: number;
}

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { data: ethBal } = useBalance({ address });
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);

    getTokenBalances(address)
      .then(async (raw: TokenBalance[]) => {
        const enriched = await Promise.all(
          raw.map(async (t) => {
            const meta = await getTokenMetadata(t.contractAddress);
            const decimals = meta.decimals ?? 18;
            const balance = Number(BigInt(t.balanceRaw)) / 10 ** decimals;
            return {
              contractAddress: t.contractAddress,
              symbol: meta.symbol ?? "?",
              name: meta.name ?? "Unknown token",
              balance,
            };
          })
        );
        setHoldings(enriched.filter((h) => h.balance > 0));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load balances."))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <main className="min-h-screen p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-inkdim hover:text-amber text-sm transition-colors">
          ← back
        </Link>
        <h1 className="text-amber font-grot text-lg">PORTFOLIO</h1>
      </div>

      {!isConnected ? (
        <div className="text-inkdim text-sm">Connect a wallet to view your portfolio.</div>
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="border border-line rounded-sm p-4">
            <div className="text-xs text-inkdim uppercase tracking-wider mb-1">
              Native Balance
            </div>
            <div className="text-3xl text-ink font-grot">
              {ethBal ? `${Number(ethBal.formatted).toFixed(4)} ${ethBal.symbol}` : "…"}
            </div>
          </div>

          <div className="border border-line rounded-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr] gap-2 px-3 py-2 text-xs text-inkdim border-b border-line bg-panel2 uppercase tracking-wider">
              <span>Token</span>
              <span className="text-right">Balance</span>
            </div>
            {loading && (
              <div className="p-4 text-center text-inkdim text-xs">Loading token balances…</div>
            )}
            {error && <div className="p-4 text-center text-red text-xs">{error}</div>}
            {!loading && !error && holdings.length === 0 && (
              <div className="p-4 text-center text-inkdim text-xs">No ERC-20 holdings found.</div>
            )}
            {holdings.map((h) => (
              <div
                key={h.contractAddress}
                className="grid grid-cols-[1fr_1fr] gap-2 px-3 py-2.5 text-sm border-b border-line/50"
              >
                <div>
                  <div className="text-ink">{h.symbol}</div>
                  <div className="text-inkdim text-xs">{h.name}</div>
                </div>
                <div className="text-right text-ink">{h.balance.toFixed(4)}</div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-inkdim">
            USD values aren't shown — cross-reference each contract address
            against DexScreener's search endpoint (lib/dexscreener.ts) to
            price these if you want a total portfolio value in dollars.
          </p>
        </div>
      )}
    </main>
  );
}
