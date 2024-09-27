import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useDropzone } from 'react-dropzone';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

const interestsList = [
  "Reading", "Traveling", "Cooking", "Sports", "Music", "Movies", "Gaming", "Fitness",
  "Photography", "Art", "Technology", "Science", "Writing", "Dancing", "Hiking", "Fishing",
  "Gardening", "Crafting", "Yoga", "Meditation"
];

export default function CreateProfileForm() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    about_me: '',
    interests: [],
    image: null,
    location: '',
    height: '',
    gender: '',
    work: '',
    relationship_type: ''
  });

  useEffect(() => {
    if (account) {
      checkProfile();
    }
  }, [account]);

  const checkProfile = async () => {
    try {
      const resourceType = `${moduleAddress}::${moduleName}::Profile`;
      const profileData = await client.getAccountResource({
        accountAddress: account.address,
        resourceType: resourceType,
      });
      setProfile(profileData);
    } catch (error) {
      console.log("Profile not found");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter(interest => interest !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFormData(prev => ({ ...prev, image: acceptedFiles[0] }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert image file to byte array
    const imageBytes = formData.image ? await formData.image.arrayBuffer() : new ArrayBuffer(0);

    const payload = {
      function: `${moduleAddress}::${moduleName}::create_profile`,
      type_arguments: [],
      arguments: [
        formData.name,
        formData.bio,
        formData.about_me,
        formData.interests.join(','),
        Array.from(new Uint8Array(imageBytes)),
        formData.location,
        parseInt(formData.height),
        formData.gender,
        formData.work,
        formData.relationship_type
      ]
    };

    try {
      const response = await signAndSubmitTransaction({ data: payload });
      console.log(response);
      await checkProfile();
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          {profile ? (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Profile</h2>
              <div className="space-y-2">
                <p><span className="font-semibold">Name:</span> {profile.name}</p>
                <p><span className="font-semibold">Bio:</span> {profile.bio}</p>
                <p><span className="font-semibold">About Me:</span> {profile.about_me}</p>
                <p><span className="font-semibold">Interests:</span> {profile.interests.join(', ')}</p>
                <p><span className="font-semibold">Location:</span> {profile.location}</p>
                <p><span className="font-semibold">Height:</span> {profile.height} cm</p>
                <p><span className="font-semibold">Gender:</span> {profile.gender}</p>
                <p><span className="font-semibold">Work:</span> {profile.work}</p>
                <p><span className="font-semibold">Relationship Type:</span> {profile.relationship_type}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Your Profile</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required 
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio:</label>
                <input type="text" id="bio" name="bio" value={formData.bio} onChange={handleChange} required 
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image:</label>
                <div {...getRootProps()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <input {...getInputProps()} />
                      <p className="pl-1">Drag 'n' drop an image here, or click to select a file</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {formData.image && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected file: {formData.image.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="about_me" className="block text-sm font-medium text-gray-700">About Me:</label>
                <textarea id="about_me" name="about_me" value={formData.about_me} onChange={handleChange} required 
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Interests:</label>
                <div className="grid grid-cols-2 gap-2">
                  {interestsList.map((interest) => (
                    <div key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        id={interest}
                        name="interests"
                        value={interest}
                        checked={formData.interests.includes(interest)}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={interest} className="ml-2 block text-sm text-gray-700">
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location:</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required 
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (in cm):</label>
                <input type="number" id="height" name="height" value={formData.height} onChange={handleChange} required 
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender:</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="work" className="block text-sm font-medium text-gray-700">Work:</label>
                <input type="text" id="work" name="work" value={formData.work} onChange={handleChange} required 
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
              </div>
              <div>
                <label htmlFor="relationship_type" className="block text-sm font-medium text-gray-700">Relationship Type:</label>
                <select id="relationship_type" name="relationship_type" value={formData.relationship_type} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                  <option value="">Select Relationship Type</option>
                  <option value="Long-term Relationships">Long-term Relationships</option>
                  <option value="Monogamy">Monogamy</option>
                  <option value="Ethical Non-Monogamy">Ethical Non-Monogamy</option>
                  <option value="Casual Dating">Casual Dating</option>
                  <option value="Exploratory Dating">Exploratory Dating</option>
                  <option value="Friendship">Friendship</option>
                  <option value="Situationships">Situationships</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}