"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    try {
      // Directly sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in SessionContext will detect the change
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed!");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md rounded-md overflow-hidden shadow-md bg-white">
        {/* Header Section */}
        <div className="bg-green-100 px-6 py-4">
          <h1 className="text-2xl font-bold text-green-800">
            Login to your account
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Sign in with your email and password
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {error && (
            <p className="text-red-600 text-center text-sm mb-4">{error}</p>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-green-400
                           focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-green-400
                           focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-md py-2
                         font-semibold hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-700">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-green-700 hover:underline underline-offset-4"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
