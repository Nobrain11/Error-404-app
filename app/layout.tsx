import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ERROR 404 // TERMINAL",
  description: "Local on-chain trading terminal for Robinhood Chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="crt font-mono min-h-screen bg-void">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
