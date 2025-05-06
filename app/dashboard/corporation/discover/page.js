// app/dashboard/collector/discover/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import {
  fetchOpenListings,
  fetchRequestsByCollector,
  createRequest,
} from "@/lib/api";
import ListingCard from "@/components/ListingCard";

export default function Discover() {
  const { user, loading: sessionLoading } = useSession();
  const [listings, setListings] = useState([]);
  const [requestedIds, setRequestedIds] = useState(new Set());
  const [error, setError] = useState("");

  // once session is ready, load all open listings + your own past requests
  useEffect(() => {
    if (sessionLoading || !user) return;

    Promise.all([fetchOpenListings(), fetchRequestsByCollector(user.uid)])
      .then(([allListings, myReqs]) => {
        setListings(allListings);
        setRequestedIds(new Set(myReqs.map((r) => r.listingId)));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load listings.");
      });
  }, [user, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // filter out your own corporate posts & any you’ve already requested
  const visible = listings.filter(
    (l) => l.homeownerId !== user.uid && !requestedIds.has(l.id)
  );

  const onRequest = async (listingId) => {
    try {
      await createRequest({
        listingId,
        collectorId: user.uid,
        type: "collector",
      });
      // immediately disable that card
      setRequestedIds((prev) => new Set(prev).add(listingId));
    } catch (err) {
      console.error(err);
      alert("Request failed, please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Homeowner Listings</h1>

      {visible.length === 0 ? (
        <p className="text-gray-600">No listings available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              actionLabel="Request"
              onAction={onRequest}
              disabled={requestedIds.has(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
