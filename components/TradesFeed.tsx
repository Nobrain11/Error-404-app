"use client";

import { useEffect, useState } from "react";
import { DexPair } from "@/lib/dexscreener";
import { getTokenTransfers, Transfer } from "@/lib/alchemy";

export default function TradesFeed({ pair }: { pair: DexPair | null }) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pair) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await getTokenTransfers(pair!.baseToken.address, 25);
        if (!cancelled) {
          setTransfers(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load transfers.");
      }
    }

    load();
    const id = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pair]);

  if (!pair) return null;

  return (
    <div className="border border-line rounded-sm overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-3 py-2 text-xs text-inkdim border-b border-line bg-panel2 uppercase tracking-wider">
        <span>Time</span>
        <span className="text-right">Amount</span>
        <span className="text-right">From</span>
        <span className="text-right">To</span>
      </div>
      <div className="max-h-[260px] overflow-y-auto">
        {error && <div className="p-4 text-center text-red text-xs">{error}</div>}
        {!error && transfers.length === 0 && (
          <div className="p-4 text-center text-inkdim text-xs">Loading transfers…</div>
        )}
        {transfers.map((t) => (
          <div
            key={t.hash}
            className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 px-3 py-2 text-xs border-b border-line/50"
          >
            <span className="text-inkdim">
              {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : "—"}
            </span>
            <span className="text-right text-ink">
              {t.value !== null ? t.value.toFixed(2) : "—"} {t.asset ?? ""}
            </span>
            <span className="text-right text-inkdim">{t.from.slice(0, 6)}…</span>
            <span className="text-right text-inkdim">{t.to.slice(0, 6)}…</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-inkdim p-2 border-t border-line">
        Raw ERC-20 transfers for this token, not swap-tagged buy/sell — a
        transfer to/from the pair's LP address is a swap; filter against
        pair.pairAddress for a true buy/sell feed.
      </p>
    </div>
  );
}
