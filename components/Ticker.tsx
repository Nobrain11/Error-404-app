"use client";

import { DexPair } from "@/lib/dexscreener";

export default function Ticker({ pairs }: { pairs: DexPair[] }) {
  const items = pairs.slice(0, 12);
  const row = (keyPrefix: string) => (
    <div className="flex shrink-0">
      {items.map((p, i) => {
        const chg = p.priceChange?.h24 ?? 0;
        const up = chg >= 0;
        return (
          <div
            key={`${keyPrefix}-${p.pairAddress}-${i}`}
            className="flex items-center gap-2 px-4 border-r border-line whitespace-nowrap"
          >
            <span className="text-ink">{p.baseToken.symbol}</span>
            <span className="text-inkdim">${Number(p.priceUsd).toPrecision(4)}</span>
            <span className={up ? "text-cyan" : "text-red"}>
              {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
