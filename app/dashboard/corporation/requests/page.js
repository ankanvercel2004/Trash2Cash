"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import {
  fetchRequestsByCollector,
  fetchListing,
  markPickedUp,
  deleteRequest,
} from "@/lib/api";

export default function CorporationRequests() {
  const { user, loading: sessionLoading } = useSession();
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !user) return;

    (async () => {
      const myReqs = await fetchRequestsByCollector(user.uid);
      const enriched = await Promise.all(
        myReqs.map(async (r) => ({
          ...r,
          listing: await fetchListing(r.listingId),
        }))
      );
      setReqs(enriched);
      setLoading(false);
    })();
  }, [user, sessionLoading]);

  const handleWithdraw = async (id) => {
    if (!confirm("Withdraw this request?")) return;
    await deleteRequest(id);
    setReqs((rs) => rs.filter((r) => r.id !== id));
  };

  const handlePickedUp = async (id) => {
    await markPickedUp(id);
    setReqs((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status: "picked_up" } : r))
    );
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">My Requests</h1>

      {reqs.length === 0 ? (
        <p className="text-gray-600">You haven’t requested any listings yet.</p>
      ) : (
        <div className="space-y-6">
          {reqs.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6"
            >
              {r.listing.imageUrl && (
                <img
                  src={r.listing.imageUrl}
                  alt={r.listing.title}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
              )}

              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">
                  {r.listing.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {r.listing.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Status:</strong> {r.status}
                </p>

                {r.status === "pending" && (
                  <button
                    onClick={() => handleWithdraw(r.id)}
                    className="mr-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
                  >
                    Withdraw
                  </button>
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
