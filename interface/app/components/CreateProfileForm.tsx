import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, EntryFunctionArgumentTypes, Network, SimpleEntryFunctionArgumentTypes } from "@aptos-labs/ts-sdk";
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
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const [matchmakerActivated, setMatchmakerActivated] = useState(false);
  const [publicActivate, setPublicActivate] = useState(false);
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
    relationship_type: '',
    reward: 0,
    photo_one: null,
    photo_two: null,
    photo_three: null,
    weight: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (account) {
      checkProfile();
      checkMatchmakerActivationStatus();
    }
  }, [account]);

  const checkMatchmakerActivationStatus = async () => {
    try {
      const result = await client.view({
        payload: {
          function: `${moduleAddress}::${moduleName}::is_matchmaker`,
          typeArguments: [],
          functionArguments: [account?.address],
        },
      });

      console.log("is_matchmakert", result);
      setMatchmakerActivated(result[0] === true);
    } catch (error) {
      console.error("Error fetching matchmaker activation status:", error);
    }
  };

  const checkActivationStatus = async (profile: any) => {
    console.log("profile in checkActivationStatus", profile);
    if (profile && Array.isArray(profile) && profile[10]) {
      console.log("profile[10]", profile[10]);
      if (profile[10] === true) {
        setIsActivated(true);
      }
    } else {
      setIsActivated(false);
    }
  };

  const checkAppStateInitialized = async () => {
    try {
      const resourceType: `${string}::${string}::${string}` = `${moduleAddress}::${moduleName}::AppState`;
      if (!moduleAddress) {
        throw new Error("Module address is not defined");
      }
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

  const getProfile = async (userAddress: string | number | bigint | boolean | EntryFunctionArgumentTypes | Uint8Array<ArrayBufferLike> | ArrayBuffer | (EntryFunctionArgumentTypes | SimpleEntryFunctionArgumentTypes)[] | null | undefined) => {
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

  const checkPublicStatus = async (profile: any) => {
    console.log("profile in checkPublicStatus", profile);
    if (profile && Array.isArray(profile) && profile[14]) {
      console.log("profile[14]", profile[14]);
      if (profile[14] === true) {
        setPublicActivate(true);
      }
    } else {
      setPublicActivate(false);
    }
  };

  const checkProfile = async () => {
    try {
      const isInitialized = await checkAppStateInitialized();
      if (isInitialized) {
        const profileData = await getProfile(account?.address);
        await checkActivationStatus(profileData);
        await checkPublicStatus(profileData);

        console.log("profileData in createprofileform", profileData);
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
            activated: profileData[10],
            matchmaker: profileData[11],
            earned: profileData[12],
            reward: profileData[17],
            photo_one: profileData[18],
            photo_two: profileData[19],
            photo_three: profileData[20],
            weight: profileData[21]
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

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: any) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handlePhotoChange = (e: { target: { name: any; files: any; }; }) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const uploadImageToPinata = async (file: string | Blob) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: (file instanceof Blob && 'name' in file) ? file.name : 'unknown',
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    try {
      const response = await axios.post(url, formData, {
        maxContentLength: Infinity,
        headers: {
          'Content-Type': 'multipart/form-data',
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

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl: any = '';
    if (formData.image) {
      imageUrl = await uploadImageToPinata(formData.image);
    }

    let photoOneUrl: any = '';
    if (formData.photo_one) {
      photoOneUrl = await uploadImageToPinata(formData.photo_one);
    }

    let photoTwoUrl: any = '';
    if (formData.photo_two) {
      photoTwoUrl = await uploadImageToPinata(formData.photo_two);
    }

    let photoThreeUrl: any = '';
    if (formData.photo_three) {
      photoThreeUrl = await uploadImageToPinata(formData.photo_three);
    }

    let reward = formData.reward;
    if (reward > 0) {
      reward *= 10 ** 8;
    }

    const payload: any = {
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
        formData.relationship_type,
        reward,
        photoOneUrl,
        photoTwoUrl,
        photoThreeUrl,
        formData.weight,
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
      relationship_type: profile.relationship_type,
      reward: profile.reward / 10 ** 8,
      photo_one: profile.photo_one,
      photo_two: profile.photo_two,
      photo_three: profile.photo_three,
      weight: profile.weight
    });
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl: any = formData.image;
    if (formData.image && typeof formData.image !== 'string') {
      imageUrl = await uploadImageToPinata(formData.image);
    }

    let photoOneUrl: any = formData.photo_one;
    if (formData.photo_one && typeof formData.photo_one !== 'string') {
      photoOneUrl = await uploadImageToPinata(formData.photo_one);
    }

    let photoTwoUrl: any = formData.photo_two;
    if (formData.photo_two && typeof formData.photo_two !== 'string') {
      photoTwoUrl = await uploadImageToPinata(formData.photo_two);
    }

    let photoThreeUrl: any = formData.photo_three;
    if (formData.photo_three && typeof formData.photo_three !== 'string') {
      photoThreeUrl = await uploadImageToPinata(formData.photo_three);
    }

    const payload: any = {
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
        String(formData.relationship_type),
        formData.reward * 10 ** 8,
        photoOneUrl,
        photoTwoUrl,
        photoThreeUrl,
        // formData.weight,
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
      relationship_type: profile.relationship_type,
      reward: profile.reward,
      photo_one: profile.photo_one,
      photo_two: profile.photo_two,
      photo_three: profile.photo_three,
      weight: profile.weight
    });
    setIsEditing(false);
  };

  if (loading) {
    return <Loading />;
  }

  const handleActivateProfile = async () => {
    const payload: any = {
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

  const handleMatchmakerActivation = async () => {
    const payload: any = {
      function: `${moduleAddress}::${moduleName}::become_matchmaker`,
      typeArguments: [],
      functionArguments: [],
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      setMatchmakerActivated(true);
      console.log("activate_matchmaker response", response);
    } catch (error) {
      console.error("Error activating matchmaker:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublicActivate = async () => {
    const payload: any = {
      function: `${moduleAddress}::${moduleName}::toggle_public_status`,
      typeArguments: [],
      functionArguments: [],
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      setPublicActivate(prevState => !prevState);
      console.log("activate_public response", response);
    } catch (error) {
      console.error("Error activating public:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-[5%]">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-3xl">
        <div className="p-8">
          {profile && !isEditing ? (
            <ProfileView
              profile={profile}
              onEdit={handleEdit}
              isActivated={isActivated}
              onActivate={handleActivateProfile}
              onMatchmakerActivate={handleMatchmakerActivation}
              onPublicActivate={handlePublicActivate}
              publicActivate={publicActivate}
              matchmakerActivated={matchmakerActivated}
            />
          ) : (
            <ProfileForm
              formData={formData}
              isEditing={isEditing}
              loading={loading}
              onChange={handleChange}
              onImageChange={handleImageChange}
              onPhotoChange={handlePhotoChange}
              onSubmit={isEditing ? handleUpdateSubmit : handleSubmit}
              onCancelEdit={handleCancelEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}