import { Aptos, AptosConfig, Network, AccountAddress, Hex } from "@aptos-labs/ts-sdk";

// Replace with your module's address
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const MODULE_NAME = "core";
const RESOURCE_ACCOUNT_ADDRESS: any = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

// Network configuration
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

export default async function checkAndInitialize(address: string, signAndSubmitTransaction: any) {
  try {
    const resourceType: any = `${address}::${MODULE_NAME}::AppState`;
    const resource = await aptos.getAccountResource({
      accountAddress: address,
      resourceType: resourceType,
    });

    if (resource) {
      console.log("App is already initialized", resource);
      return true;
    }
  } catch (error: any) {
      console.log("App is not initialized. Initializing now...");
      
      // Initialize the app
      const payload = {
        function: `${address}::${MODULE_NAME}::initialize`,
        typeArguments: [],
        functionArguments: [],
      };
      
      const response = await signAndSubmitTransaction({ data: payload });
      console.log(response, "responsee");

      console.log("App initialized successfully", response);
      return true;
  }
}