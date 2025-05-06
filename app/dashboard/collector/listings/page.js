"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import { fetchHomeownerListings, deleteListing } from "@/lib/api";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";

export default function MyCollectorListings() {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!sessionLoading && user) {
      fetchHomeownerListings(user.uid)
        .then((data) => setListings(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, sessionLoading]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(id);
      setListings((ls) => ls.filter((l) => l.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

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
        <p className="text-gray-600">You haven’t created any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
              <ListingCard
                listing={l}
                actionLabel="View Requests"
                onAction={() => router.push(`/dashboard/collector/listings/${l.id}`)}
              />
              <div className="px-4 py-3 border-t flex justify-end space-x-4">
                <Link
                  href={`/dashboard/collector/listings/${l.id}/edit`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(l.id)}
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
