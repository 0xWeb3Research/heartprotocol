import React from 'react';
import { Sparkle } from 'lucide-react';

export default function ProfileView({ profile, onEdit, isActivated, onActivate, onMatchmakerActivate, matchmakerActivated, onPublicActivate, publicActivate }) {
  return (
    <div className="p-6 space-y-6">
      {profile.image && (
        <div className="flex justify-center mb-6">
          <img
            src={profile.image}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
          />
        </div>
      )}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h2>
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
          <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <Sparkle name="sparkle" className="mr-1 text-yellow" />
            Reward: {profile.reward / 10 ** 8} $APT
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

        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center mt-4 space-y-2 md:space-y-0 md:space-x-2">
        {isActivated ? (
          <button
            type="button"
            disabled
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 cursor-not-allowed"
          >
            Activated
          </button>
        ) : (
          <button
            type="button"
            onClick={onActivate}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Activate Profile
          </button>
        )}
        {matchmakerActivated ? (
          <button
            type="button"
            disabled
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 cursor-not-allowed"
          >
            Matchmaker
          </button>
        ) : (
          <button
            type="button"
            onClick={onMatchmakerActivate}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Be A Matchmaker
          </button>
        )}
        <button
          type="button"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EA728C]"
        >
          Earned: {isNaN(parseInt(profile?.earned)) || parseInt(profile.earned) === 0 ? 0 : parseInt(profile.earned) / 10 ** 8} $APT
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onPublicActivate}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${publicActivate ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {publicActivate ? 'Public' : 'Private'}
        </button>
      </div>
      <div>
        {profile.photo_one && (
          <div className='p-2'>
            <img src={profile.photo_one} alt="Profile" className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
        {profile.photo_two && (
          <div className='p-2'>
            <img src={profile.photo_two} alt="Profile" className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
        {profile.photo_three && (
          <div className='p-2'>
            <img src={profile.photo_three} alt="Profile" className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}