import React, { useEffect, useState } from 'react'

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

function FeesCollected() {
    const { account } = useWallet();
    const [feesCollected, setFeesCollected] = useState(0);

    useEffect(() => {
        if (account) {
            getFeesCollected();
        }
      }, [account]);


      const getFeesCollected = async () => {
        try {
            const result = await client.view({
              payload: {
                function: `${moduleAddress}::${moduleName}::get_contract_balance`,
                typeArguments: [],
                functionArguments: [],
              },
            });
      
            const fee = parseInt(result[0], 10) / 10**8;
            setFeesCollected(fee);
            return result;
          } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
          }
      }

  return (
    <div className='container mx-auto p-4'>
    <div className="bg-gray-100 p-4 rounded-lg">
        <div className="bg-gray-200 p-2 rounded">
            Platform has collected {feesCollected} APT in fees.
        </div>
    </div>
</div>
  )
}

export default FeesCollected