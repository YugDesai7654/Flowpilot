import React from "react";
import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-10">
        <Image
          src="/dashboard.png"
          alt="Coming Soon Illustration"
          width={200}
          height={200}
          className="mx-auto rounded-2xl shadow-2xl"
        />
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-800">Coming Soon</h1>
      <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl">
        We&apos;re working hard to bring you this feature. Stay tuned for updates!
      </p>
      <div className="flex gap-3 justify-center">
        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        <span className="inline-block w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
      </div>
    </div>
  );
} 