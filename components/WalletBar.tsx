"use client";

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletBar() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: bal } = useBalance({ address });

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-inkdim">
          {bal ? `${Number(bal.formatted).toFixed(4)} ${bal.symbol}` : "…"}
        </span>
        <span className="px-2 py-1 border border-cyan/40 text-cyan rounded-sm shadow-glowcyan">
          {short(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-inkdim hover:text-red transition-colors"
        >
          [disconnect]
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((c) => (
        <button
          key={c.uid}
          onClick={() => connect({ connector: c })}
          disabled={isPending}
          className="px-3 py-1.5 text-sm border border-amber/50 text-amber rounded-sm hover:shadow-glow hover:bg-amber/10 transition-all disabled:opacity-50"
        >
          {isPending ? "connecting…" : `connect ${c.name}`}
        </button>
      ))}
    </div>
  );
}
