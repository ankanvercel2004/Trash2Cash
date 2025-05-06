// app/upload/page.js
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { FaRupeeSign, FaPhotoVideo } from "react-icons/fa";
import { createListing } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    wasteType: "Plastic",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { title, description, price, wasteType } = form;
    if (!title || !description || !price || !imageFile) {
      setError("Please fill in all fields and select an image.");
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Get signature, timestamp & api_key from our API route
      const sigRes = await fetch("/api/cloudinary-signature");
      if (!sigRes.ok) throw new Error("Could not get upload signature");
      const { signature, timestamp, api_key } = await sigRes.json();

      // 2️⃣ Upload to Cloudinary
      const data = new FormData();
      data.append("file", imageFile);
      data.append("api_key", api_key);
      data.append("timestamp", timestamp);
      data.append("signature", signature);
      // optional: data.append("folder", "listings");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { secure_url: imageUrl } = await uploadRes.json();

      // 3️⃣ Create the listing in Firestore
      await createListing({
        homeownerId: user.uid,
        title,
        description,
        price: parseFloat(price),
        wasteType,
        imageUrl,
      });

      // 4️⃣ Redirect to homeowner listings
      router.push("/dashboard/homeowner/listings");
    } catch (err) {
      console.error(err);
      setError("Failed to create listing. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          New Waste Listing
        </h2>

        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Plastic Bottles"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Waste Type */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Waste Type</label>
            <select
              name="wasteType"
              value={form.wasteType}
              onChange={handleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option>Plastic</option>
              <option>Electronics</option>
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col relative">
            <label className="mb-2 font-medium text-gray-700">Price (₹)</label>
            <span className="absolute top-12 left-4 text-gray-500">
              <FaRupeeSign />
            </span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Image Picker */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Photo</label>
            <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 hover:border-green-400 transition">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-contain h-full"
                />
              ) : (
                <span className="text-gray-400">
                  <FaPhotoVideo className="text-2xl mx-auto" />
                  <span className="block mt-2">Click to select</span>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your waste item..."
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-8 w-full py-3 text-lg font-semibold rounded-lg text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {loading ? "Uploading…" : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
