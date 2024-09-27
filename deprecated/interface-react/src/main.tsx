import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

const wallets = [new PetraWallet()];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
    <App />
    </AptosWalletAdapterProvider>
  </StrictMode>,
)
