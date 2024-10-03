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
    const { account } = useWallet();
    const [matchProfile, setMatchProfile] = useState(null);
    const [recommenderProfile, setRecommenderProfile] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [profileIndex, setProfileIndex] = useState(0);

    const getProfile = async (address) => {
        try {
            const result = await client.view({
                payload: {
                    function: `${moduleAddress}::${moduleName}::get_profile`,
                    typeArguments: [],
                    functionArguments: [address],
                },
            });

            console.log("getProfile result", result);
            return result;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const getAllProfiles = async () => {
        try {
            const profileData = await getProfile(account.address);
            setProfiles(profileData[13] || []);

            if (profileData && profileData.length > 0) {
                console.log("profileData", profileData);
                loadProfiles(profileData[13], 0);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    const loadProfiles = async (profilesArray, index) => {
        if (index < profilesArray.length) {
            const profile = profilesArray[index];
            const matchProfileData = await getProfile(profile.match);
            const recommenderProfileData = await getProfile(profile.recommender);

            setMatchProfile(matchProfileData);
            setRecommenderProfile(recommenderProfileData);
        }
    };

    const handleLike = () => {
        const newIndex = profileIndex < profiles.length - 1 ? profileIndex + 1 : 0;
        setProfileIndex(newIndex);
        loadProfiles(profiles, newIndex);
    };

    const handleDislike = () => {
        const newIndex = profileIndex < profiles.length - 1 ? profileIndex + 1 : 0;
        setProfileIndex(newIndex);
        loadProfiles(profiles, newIndex);
    };

    useEffect(() => {
        if (account) {
            getAllProfiles();
        }
    }, [account]);

    return (
        <div className="flex flex-col h-screen" style={{ marginTop: '5%' }}>
            <div className="flex-grow p-4">
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                        {/* Main Profile Card */}
                        <div className="w-full lg:w-2/3 bg-gray-100 p-4 rounded-lg">
                            <div className="space-y-4">
                                {matchProfile ? (
                                    <>
                                        <Card className="transition-opacity duration-500">
                                            <CardContent className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <img src={matchProfile[4]} alt={matchProfile[0]} className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
                                                    <p className="text-3xl font-bold text-gray-900 mb-2">{matchProfile[0]}</p>
                                                    <p className="text-sm text-gray-600 mb-4">{matchProfile[3]}</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                    <div>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">About Me:</strong> {matchProfile[1]}</p>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">Interests:</strong> {matchProfile[2]}</p>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">Location:</strong> {matchProfile[5]}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">Height:</strong> {matchProfile[6]}</p>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">Gender:</strong> {matchProfile[7]}</p>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">Favorite Chain:</strong> {matchProfile[8]}</p>
                                                        <p className="text-sm text-gray-700"><strong className="font-semibold">Relationship Type:</strong> {matchProfile[9]}</p>
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
                        {/* Recommended By Card */}
                        <div className="w-full lg:w-1/3 bg-gray-100 p-4 rounded-lg">
                            <div className="mb-4 bg-gray-200 p-2 rounded">
                                {recommenderProfile ? `You have ${recommenderProfile ? 1 : 0} profile(s) in recommended` : "You have no recommended profiles"}
                            </div>
                            <div className="bg-gray-200 p-2 rounded">
                                you have {profiles.length} profile(s) in liked list
                            </div>
                            <div className="w-full bg-gray-100 p-4 rounded-lg">
                                <h2 className="text-xl font-bold mb-4">Recommended By</h2>
                                {recommenderProfile ? (
                                    <Card className="transition-opacity duration-500">
                                        <CardContent className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <img src={recommenderProfile[4]} alt={recommenderProfile[0]} className="object-cover w-32 h-32 mx-auto rounded-full mb-4 border-4 border-indigo-500" />
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
        </div>
    );
};

export default MatchPageContainer;