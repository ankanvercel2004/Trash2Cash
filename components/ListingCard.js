// components/ListingCard.js
"use client";

import { useState } from "react";

export default function ListingCard({
  listing,
  actionLabel,
  onAction,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      await onAction(listing.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-40 w-full bg-gray-100">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {listing.title}
        </h2>

        {/* Type & Price */}
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">{listing.wasteType}</span> — ₹
          {listing.price}
        </p>

        {/* Description */}
        <p className="text-gray-700 flex-1 mb-4">{listing.description}</p>

        {/* Request Button */}
        <button
          onClick={handleClick}
          disabled={disabled || loading}
          className={`mt-auto w-full py-2 rounded-lg text-white font-semibold transition ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : loading
              ? "bg-yellow-500"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {disabled ? "Requested" : loading ? "…" : actionLabel}
        </button>
      </div>
    </div>
  );
}
