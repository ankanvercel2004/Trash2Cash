"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { fetchListing, updateListing } from "@/lib/api";
import { FaPhotoVideo, FaRupeeSign } from "react-icons/fa";

export default function EditCollectorListing() {
  const { listingId } = useParams();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    wasteType: "Plastic",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionLoading && user) {
      fetchListing(listingId)
        .then((data) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            wasteType: data.wasteType || "Plastic",
          });
          setImagePreview(data.imageUrl || "");
        })
        .catch(() => setError("Failed to load."))
        .finally(() => setLoading(false));
    }
  }, [listingId, sessionLoading, user]);

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
    if (!title || !description || !price) {
      setError("Title, description, and price are required.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        // Cloudinary upload logic
        const sigRes = await fetch("/api/cloudinary-signature");
        if (!sigRes.ok) throw new Error();
        const { signature, timestamp, api_key } = await sigRes.json();
        const data = new FormData();
        data.append("file", imageFile);
        data.append("api_key", api_key);
        data.append("timestamp", timestamp);
        data.append("signature", signature);
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: data }
        );
        if (!uploadRes.ok) throw new Error();
        const json = await uploadRes.json();
        imageUrl = json.secure_url;
      }

      await updateListing(listingId, {
        title,
        description,
        price: parseFloat(price),
        wasteType,
        imageUrl,
      });

      router.push("/dashboard/collector/listings");
    } catch {
      setError("Save failed.");
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg"
      >
        <h2 className="text-3xl font-bold mb-6">Edit Corporate Listing</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Image Picker */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Photo</label>
          <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 mb-4 hover:border-blue-400">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="object-contain h-full"
              />
            ) : (
              <span className="text-gray-400">
                <FaPhotoVideo className="text-2xl mx-auto" />
                <div>Click to select</div>
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

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="mb-2">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="px-4 py-2 border rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2">Waste Type</label>
            <select
              name="wasteType"
              value={form.wasteType}
              onChange={handleChange}
              className="px-4 py-2 border rounded"
            >
              <option>Plastic</option>
              <option>Electronics</option>
            </select>
          </div>
          <div className="flex flex-col relative">
            <label className="mb-2">Price (₹)</label>
            <span className="absolute top-10 left-4 text-gray-500">
              <FaRupeeSign />
            </span>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              step="0.01"
              className="pl-10 pr-4 py-2 border rounded"
            />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="px-4 py-2 border rounded resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`mt-8 w-full py-3 text-white font-semibold rounded-lg ${
            saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
