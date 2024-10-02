import React from 'react';

export default function ProfileView({ profile, onEdit, isActivated, onActivate, onMatchmakerActivate, matchmakerActivated }) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-700"><strong className="font-semibold">About Me:</strong> {profile.about_me}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Interests:</strong> {profile.interests}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Location:</strong> {profile.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Height:</strong> {profile.height}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Gender:</strong> {profile.gender}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Favorite Chain:</strong> {profile.favoritechain}</p>
          <p className="text-sm text-gray-700"><strong className="font-semibold">Relationship Type:</strong> {profile.relationship_type}</p>
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
        Earned: {isNaN(parseInt(profile?.earned)) ? 0 : parseInt(profile.earned)} $APT
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}