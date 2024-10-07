'use client'

import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useRouter } from 'next/navigation';
import { Trash } from 'lucide-react';
import Loading from './Loading';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

function Connection() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [profiles, setProfiles] = useState([]);
    const [myAddress, setMyAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (account) {
            getProfile(account?.address);
            setMyAddress(account?.address);
        }
    }, [account]);

    const getProfile = async (userAddress: any) => {
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
            const profileAddresses = Array.isArray(result[16]) ? result[16].map((item) => item.profile) : [];

            // Fetch each profile's data
            const profilesData: any = await Promise.all(profileAddresses.map(async (address) => {
                return await fetchProfileData(address);
            }));

            setProfiles(profilesData);
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        } finally {
            setLoading(false); // Set loading to false after data is fetched
        }
    };

    const fetchProfileData = async (address: any) => {
        try {
            const result = await client.view({
                payload: {
                    function: `${moduleAddress}::${moduleName}::get_profile`,
                    typeArguments: [],
                    functionArguments: [address],
                },
            });

            return { address, data: result };
        } catch (error) {
            console.error("Error fetching profile data:", error);
            return null;
        }
    };

    const handleChatClick = (otherUserAddress: string) => {
        if (myAddress && otherUserAddress) {
            router.push(`/app/chat?myAddress=${myAddress}&otherUserAddress=${otherUserAddress}`);
        }
    };

    if (loading) {
        return <Loading />;
    }

    const handleUnmatch = async (address: string) => {
        console.log("Unmatching profile", address);

        const payload: any = {
            function: `${moduleAddress}::${moduleName}::unmatch`,
            typeArguments: [],
            functionArguments: [address],
        };

        try {
            const response = await signAndSubmitTransaction({ data: payload });
            console.log(response, "response");

            // Remove the unmatched profile from the list
            setProfiles((prevProfiles) => prevProfiles.filter(profile => profile.address !== address));
        } catch (error) {
            console.error("Error unmatching profile:", error);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-xl font-bold mb-6">Your matched profiles</h1>
            <div className="grid grid-cols-1 gap-6">
                {profiles.map((profile, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between relative">
                        <div className="p-6 flex items-start space-x-4 flex-grow">
                            <div className="w-32 h-32 sm:w-52 sm:h-52 bg-gray-300 rounded-md flex-shrink-0">
                                <img src={profile.data[4]} alt="Profile" className="w-full h-full object-cover rounded-md" />
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold">{profile.data[0]}</h2>
                                <p className="text-sm text-gray-600 mt-2">{profile.data[3]}</p>
                                <p className="text-sm text-gray-600">Location: {profile.data[5]}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Height: {profile.data[6]}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Gender: {profile.data[7]}</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Favorite Chain: {profile.data[8]}</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Relationship: {profile.data[9]}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleChatClick(profile.address)}
                            className="w-full bg-pink-500 text-white px-6 py-3  shadow-md hover:bg-pink-600 transition duration-300"
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => handleUnmatch(profile.address)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition duration-300"
                        ><div className='p-4'> <Trash size={24} />
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Connection;