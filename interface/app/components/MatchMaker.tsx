import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './ui/CustomButton';
import { Card, CardContent } from './ui/CustomCard';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

const accountsPerPage = 4;

export const Matchmaker = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [walletConnectedProfile, setWalletConnectedProfile] = useState(null);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const ConnectedProfile = async () => {
    try {
      const result = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_profile`,
          typeArguments: [],
          functionArguments: [account?.address],
        },
      });

      console.log("Connected Profile:", result);
      return result;

      // if result[11] is not true show activate as matchmaker also show no data
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  useEffect(() => {
    if (account) {
      getProfiles(account?.address, currentPage * accountsPerPage, accountsPerPage);
      ConnectedProfile().then((result) => {
        setWalletConnectedProfile(result);
      });
    }
  }, [account, currentPage]);

  const getProfiles = async (userAddress, skip, take) => {
    try {
      const result = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_paginated_profile_data`,
          typeArguments: [],
          functionArguments: [skip, take],
        },
      });

      console.log("Profiles:", result);

      const publicProfiles = result[0].filter(profile => profile.profile.is_public);
      setProfiles((prevProfiles) => [...prevProfiles, ...publicProfiles]); // Append new profiles to existing ones
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const generateMoreProfiles = () => {
    getProfiles(account?.address, profiles.length, accountsPerPage);
  };

  const handleLike = async () => {

    console.log("Selected Account:", selectedAccount);
    console.log("Current Profile:", profiles[currentProfileIndex]);

    const payload = {
      function: `${moduleAddress}::${moduleName}::add_recommendation`,
      functionArguments: [
        selectedAccount?.address,
        profiles[currentProfileIndex]?.address
      ],
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
    }


    setFade(true);
    setTimeout(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      setFade(false);
    }, 500);
  };

  const handleDislike = async () => {
    setFade(true);
    setTimeout(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      setFade(false);
    }, 500);
  };


  return (
    <div className="container mx-auto p-4">
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-4">Select Account</h2>
        <div className="flex items-center justify-between">
          <Button onClick={prevPage} disabled={currentPage === 0}><ChevronLeft /></Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((account) => (
              <Card key={account.profile.name} className="cursor-pointer" onClick={() => handleAccountSelect(account)}>
                <CardContent className="p-4">
                  <img src={account.profile.image} alt={account.profile.name} className="object-cover w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full mx-auto" />
                  <p className="mt-2 text-center font-semibold">{account.profile.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={nextPage} disabled={profiles.length < accountsPerPage}><ChevronRight /></Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-left">
              <Button onClick={generateMoreProfiles}>Generate More Profiles</Button>
            </div>
            {profiles.length > 0 && (
              <Card key={profiles[currentProfileIndex].profile.name} className={`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <img src={profiles[currentProfileIndex].profile.image} alt={profiles[currentProfileIndex].profile.name} className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
                    <p className="text-3xl font-bold text-gray-900 mb-2">{profiles[currentProfileIndex].profile.name}</p>
                    <p className="text-sm text-gray-600 mb-4">{profiles[currentProfileIndex].profile.bio}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">About Me:</strong> {profiles[currentProfileIndex].profile.about_me}</p>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">Interests:</strong> {profiles[currentProfileIndex].profile.interests}</p>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">Location:</strong> {profiles[currentProfileIndex].profile.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">Height:</strong> {profiles[currentProfileIndex].profile.height}</p>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">Gender:</strong> {profiles[currentProfileIndex].profile.gender}</p>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">Favorite Chain:</strong> {profiles[currentProfileIndex].profile.favoritechain}</p>
                      <p className="text-sm text-gray-700"><strong className="font-semibold">Relationship Type:</strong> {profiles[currentProfileIndex].profile.relationship_type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex justify-between mt-4">
              <Button onClick={handleDislike} className="w-full bg-red-500 text-white mr-2">Skip</Button>
              <Button onClick={handleLike} className="w-full bg-green-500 text-white ml-2">Recommend</Button>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg">
          {selectedAccount?.profile ? (
            <h3 className="text-lg font-semibold mb-7">You are suggesting matches for {selectedAccount.profile.name}</h3>
          ) : (
            <h3 className="text-lg font-semibold mb-7">Select a profile to suggest</h3>
          )}
          {selectedAccount ? (
            <Card className="bg-white shadow-lg p-6 rounded-lg">
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center">
                  <img src={selectedAccount.profile.image} alt={selectedAccount.profile.name} className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
                  <p className="text-3xl font-bold text-gray-900 mb-2">{selectedAccount.profile.name}</p>
                  <p className="text-sm text-gray-600 mb-4">{selectedAccount.profile.bio}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">About Me:</strong> {selectedAccount.profile.about_me}</p>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">Interests:</strong> {selectedAccount.profile.interests}</p>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">Location:</strong> {selectedAccount.profile.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">Height:</strong> {selectedAccount.profile.height}</p>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">Gender:</strong> {selectedAccount.profile.gender}</p>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">Favorite Chain:</strong> {selectedAccount.profile.favoritechain}</p>
                    <p className="text-sm text-gray-700"><strong className="font-semibold">Relationship Type:</strong> {selectedAccount.profile.relationship_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-gray-500">No account selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matchmaker;