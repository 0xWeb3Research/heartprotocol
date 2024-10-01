'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";

const AccountContext = createContext(null);

export const useAccount = () => useContext(AccountContext);

const AccountProvider = ({ children }) => {
  const { account, connected, wallet } = useWallet();
  const [accountData, setAccountData] = useState(null);

  useEffect(() => {
    if (connected && account) {
      // Here you can fetch additional account data if needed
      setAccountData({
        address: account.address,
        publicKey: account.publicKey,
        connected: account.connected,
      });
    } else {
      setAccountData(null);
    }
  }, [connected, account]);

  return (
    <AccountContext.Provider value={accountData}>
      {children}
    </AccountContext.Provider>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const wallets = [new PetraWallet()];
  
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <AccountProvider>
        {children}
      </AccountProvider>
    </AptosWalletAdapterProvider>
  );
}