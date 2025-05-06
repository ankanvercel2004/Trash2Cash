// app/signup/page.js
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

const USER_TYPES = [
  { value: "homeowner", label: "Homeowner" },
  { value: "collector", label: "Local Collector" },
  { value: "corporation", label: "Big Corporation & Manufacturer" },
];

export default function SignupPage() {
  const router = useRouter();
  const { user } = useSession();

  // mode: "initial" or "complete"
  const [mode, setMode] = useState("initial");
  // initial signup fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  // complete form fields
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [userType, setUserType] = useState("");
  // errors
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // when a new user logs in via Google or email sign up, prefill and switch to complete
  useEffect(() => {
    if (user && mode === "initial") {
      setMode("complete");
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, mode]);

  const validateComplete = () => {
    const errs = {};

    // Full Name
    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = "Full name is required.";
    } else if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      errs.name = "Name can only contain letters and spaces.";
    } else if (trimmedName.split(/\s+/).length < 2) {
      errs.name = "Please enter a first and last name.";
    }

    // Age: between 18 and 120
    const trimmedAge = age.trim();
    if (!trimmedAge) {
      errs.age = "Age is required.";
    } else if (!/^\d+$/.test(trimmedAge)) {
      errs.age = "Age must be a number.";
    } else {
      const ageNum = Number(trimmedAge);
      if (ageNum < 18) {
        errs.age = "You must be at least 18 years old.";
      } else if (ageNum > 120) {
        errs.age = "Enter a realistic age.";
      }
    }

    // Phone: exactly 10 digits
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^\d+$/.test(digits)) {
      errs.phone = "Phone number can only contain digits.";
    } else if (digits.length !== 10) {
      errs.phone = "Phone number must be exactly 10 digits.";
    }

    // Profession
    const prof = profession.trim();
    if (!prof) {
      errs.profession = "Profession is required.";
    } else if (prof.length < 2) {
      errs.profession = "Enter a valid profession.";
    }

    // Location
    const loc = location.trim();
    if (!loc) {
      errs.location = "Location is required.";
    } else if (loc.length < 2) {
      errs.location = "Enter a valid location.";
    }

    // User Type
    if (!userType) {
      errs.userType = "Please select a user type.";
    }

    return errs;
  };

  // --- Handlers ---
  async function handleGoogleSignup() {
    setSubmitError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // session updates → useEffect flips to complete
    } catch (err) {
      setSubmitError(err.message || "Google signup failed.");
    }
  }

  async function handleEmailSignup(e) {
    e.preventDefault();
    setSubmitError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setSubmitError("Name, email & password are required.");
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      setLoading(false);
      setMode("complete");
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Email signup failed.");
      setLoading(false);
    }
  }

  async function handleCompleteSignup(e) {
    e.preventDefault();
    setSubmitError("");
    const errs = validateComplete();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      setLoading(true);
      const current = auth.currentUser;
      if (!current) throw new Error("Not authenticated");
      await setDoc(doc(db, "profiles", current.uid), {
        name: name.trim(),
        email: email.trim(),
        age: Number(age),
        phone: phone.trim(),
        profession: profession.trim(),
        location: location.trim(),
        userType,
      });
      await signOut(auth);
      router.push("/signup-success");
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Completing signup failed.");
      setLoading(false);
    }
  }

  // shared change handler that also clears field errors
  const onChange = (setter, field) => (e) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError("");
  };

  // --- INITIAL MODE UI ---
  if (mode === "initial") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-green-100 px-6 py-4">
            <h1 className="text-2xl font-bold text-green-900">
              Create an account
            </h1>
            <p className="text-green-800 mt-1">
              Sign up with Google or email & password.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {submitError && (
              <p className="text-red-600 text-center">{submitError}</p>
            )}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
            >
              {loading ? "Please wait…" : "Sign Up with Google"}
            </button>
            <div className="flex items-center">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-500">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-green-800">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={onChange(setName, "name")}
                  required
                  className="mt-1 w-full border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-800">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={onChange(setEmail, "email")}
                  required
                  className="mt-1 w-full border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-800">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={onChange(setPassword, "password")}
                  required
                  className="mt-1 w-full border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
              >
                {loading ? "Creating…" : "Sign Up"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-green-700 hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPLETE MODE UI ---
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow overflow-hidden">
        <div className="bg-green-100 px-6 py-4">
          <h1 className="text-2xl font-bold text-green-900">
            Complete Your Registration
          </h1>
          <p className="text-green-800 mt-1">
            Please fill in the details below.
          </p>
        </div>
        <form onSubmit={handleCompleteSignup} className="p-6 space-y-4">
          {submitError && (
            <p className="text-red-600 text-center">{submitError}</p>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={onChange(setName, "name")}
              className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none ${
                errors.name
                  ? "border-red-500"
                  : "border-green-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-red-600 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="mt-1 w-full border border-green-300 bg-gray-100 rounded px-3 py-2"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={onChange(setAge, "age")}
              className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none ${
                errors.age
                  ? "border-red-500"
                  : "border-green-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
            {errors.age && (
              <p className="mt-1 text-red-600 text-sm">{errors.age}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={onChange(setPhone, "phone")}
              className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none ${
                errors.phone
                  ? "border-red-500"
                  : "border-green-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-red-600 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Profession */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              Profession
            </label>
            <input
              type="text"
              value={profession}
              onChange={onChange(setProfession, "profession")}
              className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none ${
                errors.profession
                  ? "border-red-500"
                  : "border-green-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
            {errors.profession && (
              <p className="mt-1 text-red-600 text-sm">{errors.profession}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={onChange(setLocation, "location")}
              className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none ${
                errors.location
                  ? "border-red-500"
                  : "border-green-300 focus:ring-2 focus:ring-green-400"
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-red-600 text-sm">{errors.location}</p>
            )}
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-semibold text-green-800">
              User Type
            </label>
            <select
              value={userType}
              onChange={onChange(setUserType, "userType")}
              className={`mt-1 w-full border rounded px-3 py-2 focus:outline-none ${
                errors.userType
                  ? "border-red-500"
                  : "border-green-300 focus:ring-2 focus:ring-green-400"
              }`}
            >
              <option value="">Select User Type</option>
              {USER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.userType && (
              <p className="mt-1 text-red-600 text-sm">{errors.userType}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition ${
              loading && "opacity-50 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving…" : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
