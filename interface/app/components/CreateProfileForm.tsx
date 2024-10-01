
import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);


const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

export default function ProfileForm() {
  const {
    connect,
    account,
    network,
    connected,
    disconnect,
    wallet,
    wallets,
    signAndSubmitTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
  } = useWallet();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    userdata: ''
  });

  useEffect(() => {
    if (account) {
      checkProfile();
    }
  }, [account]);

  const checkAppStateInitialized = async () => {
    try {
      const resourceType = `${moduleAddress}::${moduleName}::AppState`;
      await client.getAccountResource({
        accountAddress: moduleAddress,
        resourceType: resourceType,
      });
      return true;
    } catch (error) {
      if (error.message.includes("Resource not found")) {
        return false;
      }
      throw error;
    }
  };

  const getProfile = async (userAddress) => {
    console.log("userAddress", userAddress);
    console.log("moduleAddress", moduleAddress);
    console.log("moduleName", moduleName);
    console.log('Fetching account resource');

    try {

      const result = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_profile`,
          typeArguments: [],
          functionArguments: [userAddress],
        },
      });
      console.log("result", result);

    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.message) console.error("Error message:", error.message);
      return null;
    }
  };

  const checkProfile = async () => {
    try {
      const isInitialized = await checkAppStateInitialized();

      if (isInitialized) {
        const profileData = await getProfile(account?.address);
        console.log("Profile data:", profileData); // Log the profile data to see its structure


        if (profileData && Array.isArray(profileData) && profileData.length >= 2) {
          setProfile({
            name: profileData[0],
            userdata: profileData[1]
          });
        } else {
          console.log("Profile not found or in unexpected format for this user");
          setProfile(null); // or set to a default value
        }
      } else {
        console.log("AppState not initialized");
        setProfile(null); // or set to a default value
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null); // or set to a default value
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      function: `${moduleAddress}::${moduleName}::create_profile`,
      functionArguments: [
        formData.name,
        formData.userdata,
      ]
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      console.log(response, "response");
      await checkProfile();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {profile ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>User Data:</strong> {profile.userdata}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                />
              </div>
              <div>
                <label htmlFor="userdata" className="block text-sm font-medium text-gray-700">User Data:</label>
                <textarea
                  id="userdata"
                  name="userdata"
                  value={formData.userdata}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}