import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import ProfileView from './ProfileView';
import ProfileForm from './ProfileForm';
import Loading from './Loading';
import axios from 'axios';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

export default function ProfileFormContainer() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    about_me: '',
    interests: '',
    image: null,
    location: '',
    height: '',
    gender: '',
    favoritechain: '',
    relationship_type: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (account) {
      checkProfile();
      checkActivationStatus();
    }
  }, [account]);


  const checkActivationStatus = async () => {
    try {
      const result = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::is_profile_activated`,
          typeArguments: [],
          functionArguments: [account?.address],
        },
      });

      console.log("is_profile_activated result", result);
      setIsActivated(result[0] === true);
    } catch (error) {
      console.error("Error fetching activation status:", error);
    }
  }

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
    try {
      const result = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::get_profile`,
          typeArguments: [],
          functionArguments: [userAddress],
        },
      });

      console.log("getProfile result", result);
      return result;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const checkProfile = async () => {
    try {
      const isInitialized = await checkAppStateInitialized();
      if (isInitialized) {
        const profileData = await getProfile(account?.address);
        console.log("profileData in craeteprofileform", profileData);
        if (profileData && Array.isArray(profileData) && profileData.length >= 2) {
          setProfile({
            name: profileData[0],
            bio: profileData[1],
            about_me: profileData[2],
            interests: profileData[3],
            image: profileData[4],
            location: profileData[5],
            height: profileData[6],
            gender: profileData[7],
            favoritechain: profileData[8],
            relationship_type: profileData[9],
            earned: profileData[10],
          });
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const uploadImageToPinata = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
      const response = await axios.post(url, formData, {
        maxContentLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
      });
      return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = '';
    if (formData.image) {
      imageUrl = await uploadImageToPinata(formData.image);
    }

    const payload = {
      function: `${moduleAddress}::${moduleName}::create_profile`,
      functionArguments: [
        formData.name,
        formData.bio,
        formData.about_me,
        formData.interests,
        imageUrl,
        formData.location,
        formData.height,
        formData.gender,
        formData.favoritechain,
        formData.relationship_type
      ],
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      await checkProfile();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio,
      about_me: profile.about_me,
      interests: profile.interests,
      image: profile.image,
      location: profile.location,
      height: profile.height,
      gender: profile.gender,
      favoritechain: profile.favoritechain,
      relationship_type: profile.relationship_type
    });
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = formData.image;
    if (formData.image && typeof formData.image !== 'string') {
      imageUrl = await uploadImageToPinata(formData.image);
    }

    const payload = {
      function: `${moduleAddress}::${moduleName}::update_profile`,
      functionArguments: [
        formData.name,
        formData.bio,
        formData.about_me,
        formData.interests,
        imageUrl,
        formData.location,
        formData.height,
        formData.gender,
        formData.favoritechain,
        formData.relationship_type
      ],
    };

    console.log("payload", payload);

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      await checkProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      bio: profile.bio,
      about_me: profile.about_me,
      interests: profile.interests,
      image: profile.image,
      location: profile.location,
      height: profile.height,
      gender: profile.gender,
      favoritechain: profile.favoritechain,
      relationship_type: profile.relationship_type
    });
    setIsEditing(false);
  };

  if (loading) {
    return <Loading />;
  }

  const handleActivateProfile = async () => {
    const payload = {
      function: `${moduleAddress}::${moduleName}::activate_profile`,
      typeArguments: [],
      functionArguments: [],
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      console.log("activate_profile response", response);
      setIsActivated(true);
    } catch (error) {
      console.error("Error activating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-[5%]">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {profile && !isEditing ? (
            <ProfileView profile={profile} onEdit={handleEdit} isActivated={isActivated}
              onActivate={handleActivateProfile} />
          ) : (
            <ProfileForm
              formData={formData}
              isEditing={isEditing}
              loading={loading}
              onChange={handleChange}
              onImageChange={handleImageChange}
              onSubmit={isEditing ? handleUpdateSubmit : handleSubmit}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}