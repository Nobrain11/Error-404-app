"use client";

import { useEffect, useState } from "react";
import { fetchRobinhoodPairs, DexPair } from "@/lib/dexscreener";
import WalletBar from "@/components/WalletBar";
import Ticker from "@/components/Ticker";
import TokenList from "@/components/TokenList";
import TradePanel from "@/components/TradePanel";
import PriceChart from "@/components/PriceChart";
import TradesFeed from "@/components/TradesFeed";
import Link from "next/link";

export default function Home() {
  const [pairs, setPairs] = useState<DexPair[]>([]);
  const [selected, setSelected] = useState<DexPair | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchRobinhoodPairs("WETH");
      setPairs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-line px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber font-grot font-bold text-lg tracking-tight">
              ERROR 404
            </span>
            <span className="text-inkdim text-sm">
              // ROBINHOOD CHAIN TERMINAL
              <span className="cursor-blink text-amber">_</span>
            </span>
          </div>
          <Link href="/portfolio" className="text-sm text-inkdim hover:text-cyan transition-colors">
            portfolio
          </Link>
        </div>
        <WalletBar />
      </header>

      <div className="border-b border-line overflow-hidden py-2 bg-panel">
        <div className="flex ticker-track w-max">
          <Ticker pairs={pairs} />
          <Ticker pairs={pairs} />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 p-4">
        <section className="flex flex-col gap-4">
          <PriceChart pair={selected} />
          <div className="text-xs text-inkdim uppercase tracking-wider">
            {loading ? "loading feed…" : `${pairs.length} pairs · robinhood chain`}
          </div>
          <TokenList pairs={pairs} onSelect={setSelected} selected={selected} />
        </section>
        <section className="flex flex-col gap-4">
          <TradePanel pair={selected} />
          <TradesFeed pair={selected} />
        </section>
      </div>
    </main>
  );
}
