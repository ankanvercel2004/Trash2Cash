// app/dashboard/collector/listings/new/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { createListing } from "@/lib/api";
import { FaPhotoVideo, FaRupeeSign } from "react-icons/fa";

export default function NewCollectorListing() {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    wasteType: "Plastic",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // redirect if not logged in
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push("/login");
    }
  }, [user, sessionLoading, router]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
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
      setError("All fields and an image are required.");
      return;
    }
    setSaving(true);
    try {
      // get signature for Cloudinary
      const sigRes = await fetch("/api/cloudinary-signature");
      if (!sigRes.ok) throw new Error("Could not get upload signature");
      const { signature, timestamp, api_key } = await sigRes.json();

      // upload image
      const data = new FormData();
      data.append("file", imageFile);
      data.append("api_key", api_key);
      data.append("timestamp", timestamp);
      data.append("signature", signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { secure_url: imageUrl } = await uploadRes.json();

      // create listing (collector acts as homeowner)
      await createListing({
        homeownerId: user.uid,
        title,
        description,
        price: parseFloat(price),
        wasteType,
        imageUrl,
      });

      router.push("/dashboard/collector/listings");
    } catch (err) {
      console.error(err);
      setError("Failed to post listing. Please try again.");
      setSaving(false);
    }
  };

  if (sessionLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          New Corporate Listing
        </h2>
        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        {/* Image Picker */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Photo</label>
          <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 mb-4 hover:border-blue-400 transition">
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

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">Waste Type</label>
            <select
              name="wasteType"
              value={form.wasteType}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Plastic</option>
              <option>Electronics</option>
            </select>
          </div>

          <div className="flex flex-col relative">
            <label className="mb-2 font-medium text-gray-700">Price (₹)</label>
            <span className="absolute top-10 left-4 text-gray-500">
              <FaRupeeSign />
            </span>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              placeholder="0.00"
              step="0.01"
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

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
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`mt-8 w-full py-3 text-lg font-semibold rounded-lg text-white transition ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {saving ? "Posting…" : "Post Listing"}
        </button>
      </form>
    </div>
  );
}
