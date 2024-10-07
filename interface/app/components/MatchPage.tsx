import React, { useEffect, useState } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import Button from './ui/CustomButton';
import { Card, CardContent } from './ui/CustomCard';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

const MatchPageContainer = () => {
    const { account, signAndSubmitTransaction } = useWallet();
    const [matchProfile, setMatchProfile] = useState(null);
    const [recommenderProfile, setRecommenderProfile] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [likedProfiles, setLikedProfiles] = useState([]);
    const [matchedProfiles, setMatchedProfiles] = useState([]);
    const [profileIndex, setProfileIndex] = useState(0);
    const [matchProfileAddress, setMatchProfileAddress] = useState(null);
    const [recommenderProfileAddress, setRecommenderProfileAddress] = useState(null);

    const getProfile = async (address) => {
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
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const getAllProfiles = async () => {
        try {
            const profileData = await getProfile(account.address);
            console.log("profileData", profileData);
            setProfiles(profileData[13] || []);

            if (profileData && profileData.length > 0) {
                console.log("profileData", profileData);
                loadProfiles(profileData[13], 0);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const getAllProfilesInLikedList = async () => {
        try {
            const profileData = await getProfile(account.address);
            console.log("profileData", profileData);
            setLikedProfiles(profileData[15] || []);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    }

    const getAllProfilesInMatchedList = async () => {
        try {
            const profileData = await getProfile(account.address);
            console.log("profileData", profileData);
            setMatchedProfiles(profileData[16] || []);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    }

    const loadProfiles = async (profilesArray, index) => {
        if (index < profilesArray.length) {
            const profile = profilesArray[index];
            const matchProfileData = await getProfile(profile.match);
            setMatchProfileAddress(profile.match);
            const recommenderProfileData = await getProfile(profile.recommender);
            setMatchProfile(matchProfileData);
            setRecommenderProfile(recommenderProfileData);
            setRecommenderProfileAddress(profile.recommender);
            setRecommenderProfileAddress(profile.recommender);
        } else {
            setMatchProfile(null);
            setRecommenderProfile(null);
        }
    };

    const handleLike = async () => {

        console.log("matchProfileAddress", matchProfileAddress);
        console.log("recommenderProfileAddress", recommenderProfileAddress);

        try {
            const payload: any = {
                function: `${moduleAddress}::${moduleName}::like_profile`,
                functionArguments: [
                    matchProfileAddress,
                    recommenderProfileAddress
                ],
            };
            const response = await signAndSubmitTransaction({ data: payload });
            console.log("response", response);
        } catch (error) {
            console.error("Error creating profile:", error);
        } finally {
            const newProfiles = [...profiles];
            newProfiles.splice(profileIndex, 1);
            setProfiles(newProfiles);
            const newIndex = profileIndex < newProfiles.length ? profileIndex : 0;
            setProfileIndex(newIndex);
            loadProfiles(newProfiles, newIndex);
        }
    };

    const handleDislike = async () => {
        try {
            const payload: any = {
                function: `${moduleAddress}::${moduleName}::skip_profile`,
                functionArguments: [
                    matchProfileAddress
                ],
            };
            const response = await signAndSubmitTransaction({ data: payload });
            console.log("response", response);
        } catch (error) {
            console.error("Error creating profile:", error);
        } finally {

            const newProfiles = [...profiles];
            newProfiles.splice(profileIndex, 1);
            setProfiles(newProfiles);
            const newIndex = profileIndex < newProfiles.length ? profileIndex : 0;
            setProfileIndex(newIndex);
            loadProfiles(newProfiles, newIndex);
        }
    };

    useEffect(() => {
        if (account) {
            getAllProfiles();
            getAllProfilesInLikedList();
            getAllProfilesInMatchedList();
        }
    }, [account]);

    return (
        <div className="flex flex-col h-screen" style={{ marginTop: '5%' }}>
            {profiles?.length > 0 ? (
                <div className="flex-grow p-4">
                    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                            <div className="w-full lg:w-2/3 bg-gray-100 p-4 rounded-lg">
                                <div className="space-y-4">
                                    {matchProfile ? (
                                        <>
                                            <Card className="transition-opacity duration-500">
                                                <CardContent className="p-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <img src={matchProfile[4]} alt={matchProfile[0]} className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
                                                        <p className="text-3xl font-bold text-gray-900 mb-2">{matchProfile[0]}</p>
                                                        <p className="text-sm text-gray-600 mb-4">{matchProfile[2]}</p>
                                                    </div>
                                                    <div className="px-4 pb-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                                About Me: {matchProfile[1]}
                                                            </span>
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                                Interests: {matchProfile[3]}
                                                            </span>
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                                Location: {matchProfile[5]}
                                                            </span>
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                                Height: {matchProfile[6]}
                                                            </span>
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                                Gender: {matchProfile[7]}
                                                            </span>
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                                Favorite Chain: {matchProfile[8]}
                                                            </span>
                                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                                Relationship Type: {matchProfile[9]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <div className="mt-4 flex space-x-4">
                                                <Button className="flex-1 bg-pink-500 py-2 rounded" onClick={handleLike}>Like</Button>
                                                <Button className="flex-1 bg-[#EA728C] py-2 rounded" onClick={handleDislike}>Skip</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-200 h-96 flex items-center justify-center text-2xl font-bold">
                                            Loading...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full lg:w-1/3 bg-gray-100 p-4 rounded-lg flex flex-col justify-center">
                                <div className="mb-4 bg-gray-200 p-2 rounded">
                                    {recommenderProfile ? `You have ${profiles.length} profile(s) in recommended` : "You have no recommended profiles"}
                                </div>
                                <div className="bg-gray-200 p-2 rounded">
                                    you have liked {likedProfiles.length} profile(s)
                                </div>
                                <div className="bg-gray-200 p-2 rounded mt-4">
                                    you have {matchedProfiles.length} profile(s) Matched
                                </div>
                                <div className="w-full bg-gray-100 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold mb-4">Recommended By</h2>
                                    {recommenderProfile ? (
                                        <Card className="transition-opacity duration-500">
                                            <CardContent className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <img src={recommenderProfile[4]} alt={recommenderProfile[0]} className="object-cover w-20 h-20 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
                                                    <p className="text-3xl font-bold text-gray-900 mb-2">{recommenderProfile[0]}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="bg-gray-200 h-96 flex items-center justify-center text-2xl font-bold">
                                            :)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) :
                (
                    <div className='container mx-auto p-4'>
                          <h1 className="text-xl font-bold mb-6">Your profile stats</h1>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="mb-4 bg-gray-200 p-2 rounded">
                                {recommenderProfile ? `You have ${profiles.length} profile(s) in recommended` : "You have no recommended profiles"}
                            </div>
                            <div className="bg-gray-200 p-2 rounded">
                                you have liked {likedProfiles.length} profile(s)
                            </div>
                            <div className="bg-gray-200 p-2 rounded mt-4">
                                you have {matchedProfiles.length} profile(s) Matched
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default MatchPageContainer;