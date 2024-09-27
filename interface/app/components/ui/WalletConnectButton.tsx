import React from 'react'
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

function WalletConnectButton() {
    return (
        <div>
            <div style={{ textAlign: "right", paddingRight: "200px" }}>
                <WalletSelector />
            </div>
        </div>
    )
}

export default WalletConnectButton