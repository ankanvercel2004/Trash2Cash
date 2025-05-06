// app/dashboard/collector/requests/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import {
  fetchRequestsByCollector,
  fetchListing,
  markPickedUp,
} from "@/lib/api";

export default function MyRequests() {
  const { user, loading: sessionLoading } = useSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && user) {
      (async () => {
        // fetch your requests
        const myReqs = await fetchRequestsByCollector(user.uid);
        // enrich each with its full listing data
        const enriched = await Promise.all(
          myReqs.map(async (r) => ({
            ...r,
            listing: await fetchListing(r.listingId),
          }))
        );
        setRequests(enriched);
        setLoading(false);
      })();
    }
  }, [user, sessionLoading]);

  const handlePickedUp = async (reqId) => {
    await markPickedUp(reqId);
    setRequests((rs) =>
      rs.map((r) => (r.id === reqId ? { ...r, status: "picked_up" } : r))
    );
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading your requests…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">My Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-600">You haven’t requested any listings yet.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6"
            >
              {/* Listing Image */}
              {r.listing.imageUrl && (
                <img
                  src={r.listing.imageUrl}
                  alt={r.listing.title}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
              )}

              {/* Listing Details */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {r.listing.title}
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                  {r.listing.wasteType} — ₹{r.listing.price}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {r.listing.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Status:</strong> {r.status}
                </p>

                {/* Actions based on status */}
                {r.status === "accepted" && (
                  <div className="space-y-2 mb-4">
                    <p>
                      <strong>Pickup Location:</strong> {r.pickupLocation}
                    </p>
                    <p>
                      <strong>Contact:</strong> {r.contactNumber}
                    </p>
                  </div>
                )}

                {r.status === "accepted" && (
                  <button
                    onClick={() => handlePickedUp(r.id)}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400"
                  >
                    Mark Picked Up
                  </button>
                )}

                {r.status === "picked_up" && (
                  <span className="inline-block px-4 py-2 bg-blue-500 text-white rounded">
                    Waiting for Payment
                  </span>
                )}

                {r.status === "payment_received" && (
                  <span className="inline-block px-4 py-2 bg-green-600 text-white rounded">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
