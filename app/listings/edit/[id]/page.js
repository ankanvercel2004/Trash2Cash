"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";

export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [existingImageData, setExistingImageData] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Convert file to base64
  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Load the existing listing details
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch listing.");

        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setPickupDate(data.pickupDate);
        setExistingImageData(data.imageData || null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading listing.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchListing();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let imageData = existingImageData;
      if (selectedFile) {
        imageData = await convertFileToBase64(selectedFile);
      }

      const response = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          pickupDate,
          imageData,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update listing.");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to edit your listing.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-green-800 mb-4">Edit Listing</h1>
        {error && (
          <p className="text-red-600 text-center text-sm mb-4">{error}</p>
        )}
        <form onSubmit={handleUpdateListing} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-800 mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-green-300 p-2 rounded"
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
              className="w-full border border-green-300 p-2 rounded"
            />
          </div>
          {/* Image Upload Section */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-2">
              <img
                src={
                  previewUrl ||
                  existingImageData ||
                  "https://via.placeholder.com/100?text=No+Image"
                }
                alt="Listing Preview"
                className="object-cover w-24 h-24 rounded border border-green-300"
              />
            </div>
            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
            >
              Upload New Image
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
            {saving ? "Updating..." : "Update Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
