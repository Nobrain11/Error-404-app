"use client";

import { DexPair } from "@/lib/dexscreener";

export default function PriceChart({ pair }: { pair: DexPair | null }) {
  if (!pair) {
    return (
      <div className="border border-line rounded-sm h-[420px] flex items-center justify-center text-inkdim text-sm">
        Select a pair to load its chart.
      </div>
    );
  }

  const embedUrl = `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="border border-line rounded-sm overflow-hidden h-[420px]">
      <iframe
        key={pair.pairAddress}
        src={embedUrl}
        className="w-full h-full"
        title={`${pair.baseToken.symbol} chart`}
      />
    </div>
  );
}
