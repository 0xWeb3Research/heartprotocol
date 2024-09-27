'use client';

import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const wallets = [new PetraWallet()];
    return (
      <div>
          <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
          {children}
          </AptosWalletAdapterProvider>
      </div>
    );
  }
  