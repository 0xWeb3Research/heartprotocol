import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import Button from './ui/CustomButton';
import { Card, CardContent } from './ui/CustomCard';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Sparkle } from 'lucide-react';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

const accountsPerPage = 4;

const ProfileCard = ({ profile, onClick }) => (
  <Card className="cursor-pointer" onClick={onClick}>
    <CardContent className="p-4">
      <img src={profile.image} alt={profile.name} className="object-cover w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full mx-auto" />
      <p className="mt-2 text-center font-semibold">{profile.name}</p>
      <span className="flex items-center px-2 mt-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
        <Sparkle name="sparkle" className="mr-1 text-yellow" />
        Reward: {profile.reward / 10 ** 8} $APT
      </span>
    </CardContent>
  </Card>
);

const ProfileDetails = ({ profile }) => (
  <Card className="bg-white shadow-lg p-6 rounded-lg">
    <CardContent className="p-4 text-center">
      <div className=" flex-col items-center">
        <img src={profile.image} alt={profile.name} className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
        <p className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</p>
        <p className="text-sm text-gray-600 mb-4">{profile.bio}</p>
      </div>
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            About Me: {profile.about_me}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Interests: {profile.interests}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            Location: {profile.location}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Height: {profile.height}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Gender: {profile.gender}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            Favorite Chain: {profile.favoritechain}
          </span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Relationship Type: {profile.relationship_type}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Weight: {profile.weight}
          </span>
          <span className="flex items-center px-2 mt-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <Sparkle name="sparkle" className="mr-1 text-yellow" />
            Reward: {profile.reward / 10 ** 8} $APT
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfileSelector = ({ profiles, onSelect, onPrevPage, onNextPage, currentPage }) => (
  <div className="bg-gray-100 p-4 rounded-lg mb-4">
    <h2 className="text-xl font-bold mb-4">Select Account</h2>
    <div className="flex items-center justify-between">
      <Button onClick={onPrevPage} disabled={currentPage === 0}><ChevronLeft /></Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <ProfileCard key={profile.profile.name} profile={profile.profile} onClick={() => onSelect(profile)} />
        ))}
      </div>
      <Button onClick={onNextPage} disabled={profiles.length < accountsPerPage}><ChevronRight /></Button>
    </div>
  </div>
);

const MatchmakerActions = ({ onSkip, onRecommend }) => (
  <div className="flex justify-between mt-4">
    <Button onClick={onSkip} className="w-full bg-[#EA728C] text-white mr-2">Skip</Button>
    <Button onClick={onRecommend} className="w-full bg-pink-500 text-white ml-2">Recommend</Button>
  </div>
);

const SkeletonLoader = () => (
  <Card className="bg-white shadow-lg p-6 rounded-lg animate-pulse">
    <CardContent className="p-4 text-center">
      <div className=" flex-col items-center">
        <div className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500 bg-gray-300"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Matchmaker = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [walletConnectedProfile, setWalletConnectedProfile] = useState(null);
  const [isMatchmaker, setIsMatchmaker] = useState(false);
  const [skippedProfiles, setSkippedProfiles] = useState([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const [currentRecommendedProfileIndex, setCurrentRecommendedProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      getProfiles(account?.address, currentPage * accountsPerPage, accountsPerPage);
      ConnectedProfile().then((result) => {
        setWalletConnectedProfile(result);
        setIsMatchmaker(result[11]);
      });
    }
  }, [account, currentPage]);

  useEffect(() => {
    generateMoreRecommendedProfiles();
  }, []);

  const getProfiles = async (userAddress, skip, take) => {
    setIsLoading(true);
    try {
      const result: any = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_paginated_profile_data`,
          typeArguments: [],
          functionArguments: [skip, take],
        },
      });

      const publicProfiles = result[0].filter(profile => profile.profile.is_public);
      const activatedProfile = publicProfiles.filter(profile => profile.profile.activated);

      setProfiles(activatedProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
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
      return result;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const generateMoreProfiles = () => {
    getProfiles(account?.address, (currentPage + 1) * accountsPerPage, accountsPerPage);
    nextPage();
  };

  const generateMoreRecommendedProfiles = async () => {
    try {
      const result: any = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_paginated_profile_data`,
          typeArguments: [],
          functionArguments: [0, accountsPerPage], // Adjust skip and take as needed
        },
      });

      console.log("Recommended profiles", result);

      const publicProfiles = result[0].filter(profile => profile.profile.is_public);
      const activatedProfile = publicProfiles.filter(profile => profile.profile.activated);

      setRecommendedProfiles(activatedProfile);
      setCurrentRecommendedProfileIndex(0);
    } catch (error) {
      console.error("Error fetching recommended profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    console.log("selectedAccount", selectedAccount);
    console.log("recommendedProfiles", recommendedProfiles[currentRecommendedProfileIndex]);

    const payload: any = {
      function: `${moduleAddress}::${moduleName}::add_recommendation`,
      functionArguments: [
        selectedAccount?.address,
        recommendedProfiles[currentRecommendedProfileIndex].address,
      ],
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      // If the transaction is successful, move to the next profile
      setFade(true);
      setTimeout(() => {
        setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
        setFade(false);
      }, 500);
    } catch (error) {
      console.error("Error creating profile:", error);
      // Handle the error appropriately, but do not change the profile index
    }
  };

  const handleDislike = async () => {
    const currentProfile = recommendedProfiles[currentRecommendedProfileIndex];
    setSkippedProfiles(prev => [...prev, currentProfile]);
    moveToNextRecommendedProfile();
  };

  const moveToNextRecommendedProfile = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentRecommendedProfileIndex((prev) => (prev + 1) % recommendedProfiles.length);
      setFade(false);
    }, 500);
  };

  if (!isMatchmaker) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Become a Matchmaker</h2>
        <p className="text-gray-700 mb-4">Please deposit 1 APT to become a matchmaker.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <ProfileSelector
          profiles={profiles}
          onSelect={setSelectedAccount}
          onPrevPage={prevPage}
          onNextPage={generateMoreProfiles}
          currentPage={currentPage}
        />
      )}

      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg">
          <div className="space-y-4">
            {/* This area is called recommended profiles */}
            <Button onClick={generateMoreRecommendedProfiles} className="flex items-center space-x-2">
              <Shuffle className="text-white" size={24} />
              <span>Generate More Recommended Profiles</span>
            </Button>
            {recommendedProfiles.length > 0 && recommendedProfiles[currentRecommendedProfileIndex] && (
              <div className={`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
                <ProfileDetails profile={recommendedProfiles[currentRecommendedProfileIndex].profile} />
              </div>
            )}
            <MatchmakerActions onSkip={handleDislike} onRecommend={handleLike} />
          </div>
        </div>
        <div className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg">
          {selectedAccount ? (
            <>
              <h3 className="text-lg font-semibold mb-7">You are suggesting matches for {selectedAccount.profile.name}</h3>
              <ProfileDetails profile={selectedAccount.profile} />
            </>
          ) : (
            <h3 className="text-lg font-semibold mb-7">Select a profile to suggest</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matchmaker;