"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading } = useSession();
  const [profileData, setProfileData] = useState({
    displayName: "",
    age: "",
    phone: "",
    profession: "",
    location: "",
    photoBlob: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
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
            setProfileData({
              displayName: data.displayName ?? user.displayName ?? "",
              age: data.age ?? "",
              phone: data.phone ?? "",
              profession: data.profession ?? "",
              location: data.location ?? "",
              photoBlob: data.photoBlob ?? null,
            });
            if (data.photoBlob) {
              setPreviewUrl(data.photoBlob);  
            }
            
          } else {
            setProfileData({
              displayName: user.displayName || "",
              age: "",
              phone: "",
              profession: "",
              location: "",
              photoBlob: null,
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
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemovePhoto = async () => {
    setProfileData((prev) => ({ ...prev, photoBlob: null }));
    setPreviewUrl(null);
    setSelectedFile(null);
    toast.success("Profile photo removed.");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profileData.displayName.trim())
      newErrors.displayName = "Display Name is required.";
    if (
      !profileData.age ||
      isNaN(profileData.age) ||
      profileData.age <= 0 ||
      profileData.age > 120
    )
      newErrors.age = "Enter a valid age (1-120).";
    if (!/^\d{10}$/.test(profileData.phone))
      newErrors.phone = "Phone must be 10 digits.";
    if (!profileData.profession.trim())
      newErrors.profession = "Profession is required.";
    if (!profileData.location.trim())
      newErrors.location = "Location is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob); // <-- returns base64 string like "data:image/png;base64,..."
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      toast.error("Please correct the errors before saving.");
      return;
    }

    setSaving(true);

    try {
      let photoBase64 = profileData.photoBlob; // this will now be base64 string, not a Blob

      if (selectedFile) {
        const fileData = await selectedFile.arrayBuffer();
        const blob = new Blob([fileData], { type: selectedFile.type });
        photoBase64 = await convertBlobToBase64(blob);
      }

      const docRef = doc(db, "profiles", user.uid);
      await setDoc(
        docRef,
        { ...profileData, photoBlob: photoBase64 },
        { merge: true }
      );

      setProfileData((prev) => ({ ...prev, photoBlob: photoBase64 }));
      setPreviewUrl(photoBase64); // works since <img src="data:image/..." is valid
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }

    setSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-green-700">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-5xl w-full"
      >
        <h1 className="text-4xl font-bold text-green-800 text-center mb-10">
          Your Profile
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Left: Profile Picture */}
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="w-40 h-40 mb-4">
              <img
                src={previewUrl || "/no-image.png"}
                alt="Profile"
                className="rounded-full object-cover border-4 border-green-400 w-full h-full"
              />
            </div>
            <label
              htmlFor="fileInput"
              className="cursor-pointer mb-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full"
            >
              {previewUrl ? "Change Image" : "Upload Image"}
            </label>
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
              >
                Remove
              </button>
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Right: Profile Fields */}
          <div className="w-full md:w-2/3">
            {[
              { label: "Display Name", name: "displayName", type: "text" },
              { label: "Age", name: "age", type: "number" },
              { label: "Phone Number", name: "phone", type: "tel" },
              { label: "Profession", name: "profession", type: "text" },
              { label: "Location", name: "location", type: "text" },
            ].map((field) => (
              <div className="mb-5" key={field.name}>
                <label className="block text-green-800 mb-1 font-semibold">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={profileData[field.name] || ""}
                  onChange={handleChange}
                  className="w-full border border-green-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold text-lg"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
