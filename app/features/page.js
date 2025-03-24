"use client";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          {/* Pulsating outer circle */}
          <div className="absolute inline-flex h-32 w-32 rounded-full bg-green-400 opacity-75 animate-ping"></div>
          {/* Centered inner circle with an icon */}
          <div className="relative inline-flex rounded-full h-32 w-32 bg-green-500 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-green-800 mb-4">
          Coming Soon!
        </h1>
        <p className="text-lg text-green-700 mb-2">
          We’re working hard to bring you new features for Trash2Cash.
        </p>
        <p className="text-md text-green-600">
          Stay tuned for exciting updates!
        </p>
      </div>
    </div>
  );
}
