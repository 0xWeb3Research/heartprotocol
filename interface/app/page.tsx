'use client';

import React from 'react';
import { useRouter } from 'next/navigation'

const LandingPage = () => {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/app')
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-plus-jakarta-sans">
      <div className="max-w-2xl text-center">
        <img src="./black.png" alt="Heart Protocol" className="w-48 h-48 mx-auto mb-8" />
        
        {/* <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Heart Protocol
        </h1> */}
        
        <p className="text-lg text-gray-600 mb-12">
          Find your soulmate and earn rewards for helping others find their soulmate in the decentralized world.
        </p>

        <div className="space-y-8 mb-12">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Soulmate</h3>
            <p className="text-gray-600">Discover your perfect match using our smart algorithms.</p>
          </div>
          
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">Build meaningful connections in a secure and transparent environment.</p>
          </div>
          
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-gray-600">Get rewarded for successfully matching others and spreading soulmate connections.</p>
          </div>
        </div>

        <button
          onClick={handleGetStarted}
          className="bg-black text-white px-8 py-3 text-lg font-medium hover:bg-gray-800 transition-colors mb-8"
        >
          Get Started
        </button>

        <div className="flex items-center justify-center gap-2 text-m text-gray-500">
          <span>Built on</span>
          <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Aptos_logo_%282025%29.png" alt="Aptos" className="h-6" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;