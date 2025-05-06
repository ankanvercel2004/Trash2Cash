// app/dashboard/homeowner/listings/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import { fetchHomeownerListings, deleteListing } from "@/lib/api";

export default function MyListings() {
  const { user, loading: sessionLoading } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && user) {
      fetchHomeownerListings(user.uid)
        .then((data) => setListings(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading your listings…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>

      {listings.length === 0 ? (
        <p className="text-gray-600">You have no listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl shadow overflow-hidden flex flex-col"
            >
              {/* Clickable area to view requests */}
              <Link
                href={`/dashboard/homeowner/listings/${l.id}`}
                className="block flex-1"
              >
                {l.imageUrl ? (
                  <img
                    src={l.imageUrl}
                    alt={l.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {l.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {l.wasteType} — ₹{l.price}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {l.description}
                  </p>
                  <span className="text-sm text-gray-500">
                    Status: {l.status}
                  </span>
                </div>
              </Link>
              {/* Edit & Delete controls */}
              <div className="px-4 py-3 border-t flex justify-end space-x-4">
                <Link
                  href={`/dashboard/homeowner/listings/${l.id}/edit`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this listing?")) return;
                    try {
                      await deleteListing(l.id);
                      setListings((prev) =>
                        prev.filter((item) => item.id !== l.id)
                      );
                    } catch (err) {
                      console.error(err);
                      alert("Failed to delete listing.");
                    }
                  }}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
