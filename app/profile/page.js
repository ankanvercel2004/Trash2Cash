"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
  const { user, loading } = useSession();
  const [profileData, setProfileData] = useState({
    displayName: "",
    age: "",
    phone: "",
    profession: "",
    location: "",
    photoURL: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "profiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Fetched profile data:", data);
            setProfileData({
              displayName: data.displayName ?? user.displayName ?? "",
              age: data.age ?? "",
              phone: data.phone ?? "",
              profession: data.profession ?? "",
              location: data.location ?? "",
              photoURL: data.photoURL ?? "",
            });
            if (data.photoURL) {
              setPreviewUrl(data.photoURL);
            }
          } else {
            console.log("No profile document found, using defaults");
            setProfileData({
              displayName: user.displayName || "",
              age: "",
              phone: "",
              profession: "",
              location: "",
              photoURL: "",
            });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      };
      fetchProfile();
    }
  }, [user, loading, router]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      console.log("Preview URL set to:", objectUrl);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profileData.photoURL) return;
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profiles/${user.uid}/profile.jpg`);
      await deleteObject(storageRef);
      await setDoc(
        doc(db, "profiles", user.uid),
        { photoURL: "" },
        { merge: true }
      );
      setProfileData((prev) => ({ ...prev, photoURL: "" }));
      setPreviewUrl(null);
      setSelectedFile(null);
      alert("Profile photo removed.");
    } catch (err) {
      console.error("Error removing photo:", err);
      alert("Failed to remove photo.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      let downloadURL = profileData.photoURL; // fallback to existing URL
      if (selectedFile) {
        console.log("Uploading new image...");
        const storage = getStorage();
        const storageRef = ref(storage, `profiles/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, selectedFile);
        downloadURL = await getDownloadURL(storageRef);
        console.log("New image uploaded, download URL:", downloadURL);
      }

      // Save or update the profile data
      const docRef = doc(db, "profiles", user.uid);
      await setDoc(
        docRef,
        { ...profileData, photoURL: downloadURL },
        { merge: true }
      );
      console.log("Profile data saved with photoURL:", downloadURL);

      // Update local state so the image persists
      setProfileData((prev) => ({ ...prev, photoURL: downloadURL }));
      setPreviewUrl(downloadURL);

      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSave}
        className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-green-800 text-center">
          Your Profile
        </h1>

        {/* Profile Image Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-3">
            <img
              src={
                previewUrl || "https://via.placeholder.com/150?text=No+Image"
              }
              alt="Profile Preview"
              className="object-cover w-32 h-32 rounded-full border border-green-300"
            />
          </div>
          <div className="space-x-2">
            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
            >
              Upload Image
            </label>
            {(previewUrl || profileData.photoURL) && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md"
              >
                Remove Photo
              </button>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Profile Fields */}
        <div className="mb-4">
          <label className="block text-green-800 mb-1 font-semibold">
            Display Name
          </label>
          <input
            type="text"
            name="displayName"
            value={profileData.displayName || ""}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-green-800 mb-1 font-semibold">Age</label>
          <input
            type="number"
            name="age"
            value={profileData.age || ""}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-green-800 mb-1 font-semibold">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={profileData.phone || ""}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-green-800 mb-1 font-semibold">
            Profession
          </label>
          <input
            type="text"
            name="profession"
            value={profileData.profession || ""}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-green-800 mb-1 font-semibold">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={profileData.location || ""}
            onChange={handleChange}
            className="w-full border border-green-300 p-2 rounded focus:border-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors font-semibold"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
