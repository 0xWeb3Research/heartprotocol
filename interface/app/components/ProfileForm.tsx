import React, { useState } from 'react';

const interestsList = [
  'Decoding the Blockchain',
  'Exploring Virtual Worlds',
  'Crafting Smart Contracts',
  'Trading Meme Coins',
  'Jamming to Crypto Beats',
  'Binging on Crypto Documentaries',
  'Hiking through the Metaverse',
  'Leveling Up in Play-to-Earn Games',
  'Snapping NFT Art',
  'Creating Digital Masterpieces',
  'Fitness for Crypto Gains',
  'Gardening Virtual Land',
  'Writing DeFi Guides',
  'Tech Hacking and Innovation',
  'Fashioning Avatars with Style',
  'Dancing at DAO Parties',
  'Yoga for Blockchain Balance',
  'Fishing for Rare Tokens',
  'Crafting Unique NFTs',
  'Volunteering in Web3 Communities',
  'Crypto Trading',
  'NFT Collecting',
  'Yield Farming',
  'Participating in DAOs',
  'Gaming in the Metaverse',
  'Normal Human Stuff'
];

const blockchainChains = [
  'Aptos', 'Bitcoin', 'Ethereum', 'Binance Smart Chain', 'Cardano', 'Solana', 'Polkadot', 'Avalanche', 'Terra', 'Chainlink', 'Polygon',
  'Stellar', 'VeChain', 'Tezos', 'Algorand', 'Cosmos', 'Elrond', 'Harmony', 'Fantom', 'Near', 'Hedera', 'Other'
];

const heightOptions = ['Short', 'Tall', 'Mid', 'Haha'];
const weightOptions = ['Heavy', 'Light', 'Feather', 'Haha'];

export default function ProfileForm({ formData, isEditing, loading, onChange, onImageChange, onPhotoChange, onSubmit, onCancelEdit }) {
  const [image, setImage] = useState(null);
  const [photoOne, setPhotoOne] = useState(null);
  const [photoTwo, setPhotoTwo] = useState(null);
  const [photoThree, setPhotoThree] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    onImageChange(file);
  };

  const handlePhotoChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (name === 'photo_one') {
      setPhotoOne(file);
    } else if (name === 'photo_two') {
      setPhotoTwo(file);
    } else if (name === 'photo_three') {
      setPhotoThree(file);
    }
    onPhotoChange(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setImage(file);
    onImageChange(file);
  };

  const handleInterestsChange = (e) => {
    const { value, checked } = e.target;
    const currentInterests = formData.interests ? formData.interests.split(',') : [];
    const newInterests = checked
      ? [...currentInterests, value]
      : currentInterests.filter(interest => interest !== value);
    onChange({ target: { name: 'interests', value: newInterests.join(',') } });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Your Profile' : 'Create Your Profile'}</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image:</label>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="mt-1 block w-full rounded-md border-dashed border-2 border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 flex justify-center items-center"
        >
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            className="hidden"
          />
          {image ? (
            <p>{image.name}</p>
          ) : (
            <p>Drag and drop an image, or click to select one</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio:</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="about_me" className="block text-sm font-medium text-gray-700">About Me:</label>
        <textarea
          id="about_me"
          name="about_me"
          value={formData.about_me}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests:</label>
        <div className="grid grid-cols-2 gap-4 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
          {interestsList.map((interest, index) => (
            <div key={interest} className="flex items-center">
              <input
                type="checkbox"
                id={interest}
                name="interests"
                value={interest}
                checked={formData.interests ? formData.interests.split(',').includes(interest) : false}
                onChange={handleInterestsChange}
                className="mr-2"
              />
              <label htmlFor={interest} className="text-sm font-medium text-gray-700">{interest}</label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height:</label>
        <select
          id="height"
          name="height"
          value={formData.height}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="">Select Height</option>
          {heightOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight:</label>
        <select
          id="weight"
          name="weight"
          value={formData.weight}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="">Select Weight</option>
          {weightOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender:</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="favoritechain" className="block text-sm font-medium text-gray-700">Favorite Chain:</label>
        <select
          id="favoritechain"
          name="favoritechain"
          value={formData.favoritechain}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="">Select Favorite Chain</option>
          {blockchainChains.map(chain => (
            <option key={chain} value={chain}>{chain}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="relationship_type" className="block text-sm font-medium text-gray-700">Relationship Type:</label>
        <select
          id="relationship_type"
          name="relationship_type"
          value={formData.relationship_type}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="">Select Relationship Type</option>
          <option value="single">Single</option>
          <option value="committed">Committed</option>
          <option value="married">Married</option>
          <option value="complicated">It's Complicated</option>
        </select>
      </div>
      <div>
        <label htmlFor="reward" className="block text-sm font-medium text-gray-700">Reward $APT:</label>
        <input
          type="number"
          id="reward"
          name="reward"
          value={formData.reward}
          onChange={onChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="photo_one" className="block text-sm font-medium text-gray-700">Photo One:</label>
        <input
          type="file"
          id="photo_one"
          name="photo_one"
          onChange={handlePhotoChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="photo_two" className="block text-sm font-medium text-gray-700">Photo Two:</label>
        <input
          type="file"
          id="photo_two"
          name="photo_two"
          onChange={handlePhotoChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div>
        <label htmlFor="photo_three" className="block text-sm font-medium text-gray-700">Photo Three:</label>
        <input
          type="file"
          id="photo_three"
          name="photo_three"
          onChange={handlePhotoChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Profile' : 'Create Profile')}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}