import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

function Connection() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        if (account) {
            getProfile(account?.address);
        }
    }, [account]);

    const getProfile = async (userAddress) => {
        try {
            const result = await client.view({
                payload: {
                    function: `${moduleAddress}::${moduleName}::get_profile`,
                    typeArguments: [],
                    functionArguments: [userAddress],
                },
            });

            console.log("getProfile result", result);

            // Assuming result[16] contains the array of profiles
            const profileAddresses = result[16].map((item) => item.profile);

            // Fetch each profile's data
            const profilesData = await Promise.all(profileAddresses.map(async (address) => {
                return await fetchProfileData(address);
            }));

            setProfiles(profilesData);
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const fetchProfileData = async (address) => {
        try {
            const result = await client.view({
                payload: {
                    function: `${moduleAddress}::${moduleName}::get_profile`,
                    typeArguments: [],
                    functionArguments: [address],
                },
            });

            return result;
        } catch (error) {
            console.error("Error fetching profile data:", error);
            return null;
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Connections</h1>
            <div className="grid grid-cols-1 gap-6">
                {profiles.map((profile, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 flex items-start space-x-4">
                            <div className="w-52 h-52 bg-gray-300 rounded-md flex-shrink-0">
                                <img src={profile[4]} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold">{profile[0]}</h2>
                                <p className="text-sm text-gray-600">{profile[3]}</p>
                                <p className="text-sm text-gray-600">Location: {profile[5]}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Height: {profile[6]}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Gender: {profile[7]}</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Favorite Chain: {profile[8]}</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Relationship: {profile[9]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Connection;