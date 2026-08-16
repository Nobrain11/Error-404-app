"use client";

import { DexPair } from "@/lib/dexscreener";

function fmt(n?: number) {
  if (n === undefined) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function TokenList({
  pairs,
  onSelect,
  selected,
}: {
  pairs: DexPair[];
  onSelect: (p: DexPair) => void;
  selected?: DexPair | null;
}) {
  return (
    <div className="border border-line rounded-sm overflow-hidden">
      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 text-xs text-inkdim border-b border-line bg-panel2 uppercase tracking-wider">
        <span>Pair</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h</span>
        <span className="text-right">Liq</span>
        <span className="text-right">Vol 24h</span>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {pairs.length === 0 && (
          <div className="p-6 text-center text-inkdim text-sm">
            No pairs loaded. Waiting on feed…
          </div>
        )}
        {pairs.map((p) => {
          const chg = p.priceChange?.h24 ?? 0;
          const up = chg >= 0;
          const isSel = selected?.pairAddress === p.pairAddress;
          return (
            <button
              key={p.pairAddress}
              onClick={() => onSelect(p)}
              className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-2 w-full px-3 py-2.5 text-sm border-b border-line/50 text-left hover:bg-panel2 transition-colors ${
                isSel ? "bg-panel2 border-l-2 border-l-amber" : ""
              }`}
            >
              <span className="text-ink truncate">
                {p.baseToken.symbol}
                <span className="text-inkdim">/{p.quoteToken.symbol}</span>
              </span>
              <span className="text-right text-ink">
                ${Number(p.priceUsd).toPrecision(4)}
              </span>
              <span className={`text-right ${up ? "text-cyan" : "text-red"}`}>
                {up ? "+" : ""}
                {chg.toFixed(1)}%
              </span>
              <span className="text-right text-inkdim">
                {fmt(p.liquidity?.usd)}
              </span>
              <span className="text-right text-inkdim">
                {fmt(p.volume?.h24)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
