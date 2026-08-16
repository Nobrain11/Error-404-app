"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { DexPair } from "@/lib/dexscreener";
import { getSwapQuote } from "@/lib/zeroex";

const NATIVE_ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export default function TradePanel({ pair }: { pair: DexPair | null }) {
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: txHash, isPending: sending } =
    useSendTransaction();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotedOut, setQuotedOut] = useState<string | null>(null);

  if (!pair) {
    return (
      <div className="border border-line rounded-sm p-6 text-center text-inkdim text-sm h-full flex items-center justify-center">
        Select a pair from the scanner to trade.
      </div>
    );
  }

  const sellToken = side === "buy" ? NATIVE_ETH : pair.baseToken.address;
  const buyToken = side === "buy" ? pair.baseToken.address : NATIVE_ETH;

  async function handleGetQuote() {
    setError(null);
    setQuotedOut(null);
    if (!address) {
      setError("Connect a wallet first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount.");
      return;
    }
    setQuoting(true);
    try {
      const sellAmount = parseUnits(amount, 18).toString();
      const quote = await getSwapQuote({
        sellToken,
        buyToken,
        sellAmount,
        taker: address,
      });
      setQuotedOut(quote.buyAmount);

      sendTransaction({
        to: quote.transaction.to,
        data: quote.transaction.data,
        value: BigInt(quote.transaction.value ?? "0"),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote failed.");
    } finally {
      setQuoting(false);
    }
  }

  return (
    <div className="border border-line rounded-sm p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-ink font-grot font-medium">
            {pair.baseToken.symbol}/{pair.quoteToken.symbol}
          </div>
          <div className="text-xs text-inkdim">${pair.baseToken.address}</div>
        </div>
        <a
          href={pair.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-cyan hover:underline"
        >
          view chart ↗
        </a>
      </div>

      <div className="flex border border-line rounded-sm overflow-hidden text-sm">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 transition-colors ${
            side === "buy" ? "bg-cyan/15 text-cyan" : "text-inkdim hover:bg-panel2"
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 transition-colors ${
            side === "sell" ? "bg-red/15 text-red" : "text-inkdim hover:bg-panel2"
          }`}
        >
          SELL
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-inkdim text-xs uppercase tracking-wide">
          Amount ({side === "buy" ? "ETH" : pair.baseToken.symbol})
        </span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="bg-panel2 border border-line rounded-sm px-3 py-2 text-ink outline-none focus:border-amber"
        />
      </label>

      {quotedOut && (
        <div className="text-xs text-inkdim">
          Estimated out: <span className="text-ink">{quotedOut}</span> (raw units)
        </div>
      )}

      {error && <div className="text-xs text-red">{error}</div>}

      {!isConnected ? (
        <div className="text-xs text-inkdim text-center py-2">
          Connect a wallet above to trade.
        </div>
      ) : (
        <button
          onClick={handleGetQuote}
          disabled={quoting || sending || confirming}
          className={`py-2.5 rounded-sm font-medium transition-all disabled:opacity-50 ${
            side === "buy"
              ? "bg-cyan/15 text-cyan border border-cyan/50 hover:shadow-glowcyan"
              : "bg-red/15 text-red border border-red/50"
          }`}
        >
          {quoting
            ? "quoting…"
            : sending
            ? "confirm in wallet…"
            : confirming
            ? "confirming…"
            : `${side.toUpperCase()} ${pair.baseToken.symbol}`}
        </button>
      )}

      {confirmed && txHash && (
        <div className="text-xs text-cyan">Filled. tx {txHash.slice(0, 10)}…</div>
      )}

      <p className="text-[11px] text-inkdim leading-relaxed border-t border-line pt-3">
        Quotes route through 0x's aggregator across Robinhood Chain liquidity.
        Always verify the token contract address before trading — new pairs
        can be illiquid or malicious.
      </p>
    </div>
  );
}
