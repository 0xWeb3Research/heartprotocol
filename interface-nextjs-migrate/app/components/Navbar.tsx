'use client';

import React from 'react'
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

function Navbar() {
    return (
        <div>
            <div>Navbar</div>
            <WalletSelector />
        </div>
    )
}

export default Navbar