"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, loading } = useSession();
  const [profileData, setProfileData] = useState({ displayName: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated.
      router.push("/login");
    } else if (user) {
      // Fetch the user profile from Firestore.
      const fetchProfile = async () => {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          // Set default values if no profile exists.
          setProfileData({ displayName: user.displayName || "", bio: "" });
        }
      };
      fetchProfile();
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "profiles", user.uid);
      await setDoc(docRef, profileData, { merge: true });
      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSave}
        className="max-w-md w-full bg-white p-6 rounded shadow"
      >
        <h1 className="text-2xl font-bold mb-4 text-green-800">Your Profile</h1>
        <div className="mb-4">
          <label className="block text-green-800 mb-2">Display Name</label>
          <input
            type="text"
            name="displayName"
            value={profileData.displayName}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-green-800 mb-2">Bio</label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
