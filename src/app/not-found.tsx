"use client";
import { HomeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';


const NotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-transparent">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600 mb-4 
          bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
          404
        </h1>
        
        <h2 className="text-4xl font-semibold text-gray-200 mb-3">
          Not Found
        </h2>
        
        <p className="text-gray-300 text-lg mb-8 font-semibold">
          Page you are looking for does not exist.
        </p>
        
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center px-6 py-3 rounded-lg 
            bg-gradient-to-r from-green-500 to-emerald-600 
            hover:from-green-600 hover:to-emerald-700 
            transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <HomeIcon className="w-5 h-5 mr-2 text-white" />
          <span className="text-white font-medium">Go back</span>
        </button>
      </div>

      <div className="mt-12 text-gray-400 text-sm font-semibold">
        © 2025 Bamboo Software. All rights reserved.
      </div>
    </div>
  );
};

export default NotFound;