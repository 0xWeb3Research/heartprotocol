'use client';

import React from 'react';
import { Heart, Users, DollarSign } from 'lucide-react';

const LandingPage = () => {
  const handleGetStarted = () => {
    window.location.href = '/app';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex flex-col justify-center items-center p-4">
      <header className="text-center mb-12">
        <img src="./black.png" alt="Heart Protocol Logo" className="w-52 h-52 mx-auto mb-4" />
        {/* <h1 className="text-5xl font-bold text-purple-800 mb-4">Heart Protocol</h1> */}
        <p className="text-xl text-purple-600">Web3-based Matchmaking Platform</p>
      </header>

      <main className="max-w-4xl text-center">
        <p className="text-lg mb-8 text-gray-700">
          Find your soulmate and earn rewards for helping others find love in the decentralized world.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FeatureCard 
            icon={<Heart className="w-12 h-12 text-red-500" />}
            title="Find Love"
            description="Discover your perfect match using our advanced Web3 algorithms."
          />
          <FeatureCard 
            icon={<Users className="w-12 h-12 text-blue-500" />}
            title="Connect"
            description="Build meaningful connections in a secure and transparent environment."
          />
          <FeatureCard 
            icon={<DollarSign className="w-12 h-12 text-green-500" />}
            title="Earn Rewards"
            description="Get rewarded for successfully matching others and spreading love."
          />
        </div>

        <button
          onClick={handleGetStarted}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started
        </button>
      </main>

      <footer className="mt-16 text-gray-600">
        &copy; 2024 Heart Protocol. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-purple-700">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default LandingPage;