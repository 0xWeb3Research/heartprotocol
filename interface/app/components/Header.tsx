import React from 'react';
// @ts-ignore
import { Menu } from 'lucide-react';
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {
    NetworkName,
    InputTransactionData,
    WalletName,
    Wallet,
    useWallet,
  } from "@aptos-labs/wallet-adapter-react";
  import {
    AccountAddressInput,
    Aptos,
    AptosConfig,
    Hex,
    Network,
  } from "@aptos-labs/ts-sdk";
// add type header 

type HeaderProps = {
    toggleSidebar: () => void;
    title: string;
};

const Header = ({ toggleSidebar, title }: HeaderProps) => {

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleName = process.env.NEXT_PUBLIC_MODULE_MODULE_NAME;
const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;


    return (
        <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="mr-4 text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                </div>
                <div className="flex items-center">
                    <div className='px-4'>
                        <WalletSelector />
                    </div>
                    {/* <img
                        className="h-8 w-8 rounded-full"
                        src="/api/placeholder/32/32"
                        alt="User avatar"
                    /> */}
                </div>
            </div>
        </header>
    );
};

export default Header;