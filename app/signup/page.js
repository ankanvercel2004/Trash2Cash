"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);

    try {
      // Create a new user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user’s display name
      await updateProfile(userCredential.user, { displayName: name });

      // Optionally, create a Firestore document for the user using their UID
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
      });

      // Sign out the user so they don't remain logged in
      await signOut(auth);

      // Redirect to the login page
      router.push("/login");
    } catch (err) {
      setError(err.message || "Signup failed!");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md rounded-md overflow-hidden shadow-md bg-white">
        {/* Header Section */}
        <div className="bg-green-100 px-6 py-4">
          <h1 className="text-2xl font-bold text-green-800">
            Create an account
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Sign up with your email and password
          </p>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {error && (
            <p className="text-red-600 text-center text-sm mb-4">{error}</p>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
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
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
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
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-md py-2 font-semibold hover:bg-green-700 transition-colors"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-700">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-green-700 hover:underline underline-offset-4"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
