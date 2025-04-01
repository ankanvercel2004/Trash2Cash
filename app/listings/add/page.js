"use client";

import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";

export default function AddListingPage() {
  const { user } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  // Image upload state (BLOB as Base64)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Utility: Convert file to Base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary preview URL for display
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function handleAddListing(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    let imageData = "";
    try {
      if (selectedFile) {
        imageData = await convertFileToBase64(selectedFile);
      }
      // Create the listing via your API endpoint, including the Base64 image data
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          pickupDate,
          userId: user?.uid,
          imageData, // Save the Base64 image data
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to add listing.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
    setSaving(false);
  }

  if (!user) {
    return <div>Please log in to add a listing.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-green-800 mb-4">
          Add New Listing
        </h1>
        {error && (
          <p className="text-red-600 text-center text-sm mb-4">{error}</p>
        )}
        <form onSubmit={handleAddListing} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Listing Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Description
            </label>
            <textarea
              placeholder="Detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          {/* Image Upload Section */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-2">
              <img
                src={
                  previewUrl || "https://via.placeholder.com/100?text=No+Image"
                }
                alt="Listing Preview"
                className="object-cover w-24 h-24 rounded border border-green-300"
              />
            </div>
            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
            >
              Upload Image
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white rounded-md py-2 font-semibold hover:bg-green-700 transition-colors"
          >
            {saving ? "Saving..." : "Add Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
