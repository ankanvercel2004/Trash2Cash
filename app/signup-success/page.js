"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/login");
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50">
      <div className="flex flex-col items-center">
        {/* Animated Spinning Wheel */}
        <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-6"></div>
        
        {/* Green Tick Icon */}
        <svg
          className="w-16 h-16 text-green-600 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        
        <h1 className="text-3xl font-bold text-green-700 mb-4">Sign Up Successful!</h1>
        <p className="text-lg text-gray-600">
          Redirecting to login in {countdown} second{countdown !== 1 && "s"}...
        </p>
      </div>
    </div>
  );
}
