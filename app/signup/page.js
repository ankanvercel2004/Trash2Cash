"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useSession } from "@/contexts/SessionContext";

export default function SignupPage() {
  // Mode: "initial" for signup method selection; "complete" for additional details.
  const [mode, setMode] = useState("initial");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [userType, setUserType] = useState(""); // New field for user type
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const router = useRouter();
  const { user } = useSession();

  // When a user signs in via Google (or email), prefill name/email and switch mode.
  useEffect(() => {
    if (user && mode === "initial") {
      setMode("complete");
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, mode]);

  // --- Google Signup Handler ---
  async function handleGoogleSignup() {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The session context will update and trigger mode change.
    } catch (err) {
      setError(err.message || "Google signup failed!");
    }
  }

  // --- Email/Password Signup Handler ---
  async function handleEmailSignup(e) {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });
      setMode("complete");
    } catch (err) {
      setError(err.message || "Signup failed!");
    }
  }

  // --- Complete Signup: Save Additional Details ---
  async function handleCompleteSignup(e) {
    e.preventDefault();
    setError(null);
    try {
      if (!user) {
        setError("No authenticated user found.");
        return;
      }
      // Save additional details (including userType) in Firestore under "profiles"
      await setDoc(doc(db, "profiles", user.uid), {
        name,
        email,
        age,
        phone,
        profession,
        location,
        userType,
      });
      // Sign out and redirect to the signup-success page
      await signOut(auth);
      router.push("/signup-success");
    } catch (err) {
      setError(err.message || "Completing signup failed!");
    }
  }

  if (mode === "initial") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
        <div className="w-full max-w-md rounded-md overflow-hidden shadow-md bg-white">
          <div className="bg-green-100 px-6 py-4">
            <h1 className="text-2xl font-bold text-green-800">
              Create an account
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              Sign up using Google or with your email and password.
            </p>
          </div>
          <div className="p-6">
            {error && (
              <p className="text-red-600 text-center text-sm mb-4">{error}</p>
            )}
            <button
              onClick={handleGoogleSignup}
              className="w-full bg-green-600 text-white rounded-md py-2 font-semibold hover:bg-green-700 transition-colors mb-4"
            >
              Sign Up with Google
            </button>
            <div className="text-center text-sm text-gray-700 mb-4">OR</div>
            <form onSubmit={handleEmailSignup} className="space-y-4">
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

  // "Complete" mode: Show form for additional details
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md rounded-md overflow-hidden shadow-md bg-white">
        <div className="bg-green-100 px-6 py-4">
          <h1 className="text-2xl font-bold text-green-800">
            Complete Your Registration
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Please provide additional details to complete your signup.
          </p>
        </div>
        <div className="p-6">
          {error && (
            <p className="text-red-600 text-center text-sm mb-4">{error}</p>
          )}
          <form onSubmit={handleCompleteSignup} className="space-y-4">
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
                readOnly
                className="block w-full rounded-md border border-green-300 px-3 py-2 bg-gray-100 
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Age
              </label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2 
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="123-456-7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2 
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Profession
              </label>
              <input
                type="text"
                placeholder="e.g. Developer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2 
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2 
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-1">
                User Type
              </label>
              <select
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                className="block w-full rounded-md border border-green-300 px-3 py-2
                           focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              >
                <option value="">Select User Type</option>
                <option value="homeowner">Homeowner</option>
                <option value="collector">Local Collector</option>
                <option value="corporation">
                  Big Corporation & Manufacturer
                </option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-md py-2 font-semibold hover:bg-green-700 transition-colors"
            >
              Complete Signup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
