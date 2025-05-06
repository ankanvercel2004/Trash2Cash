// app/dashboard/collector/listings/[listingId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import {
  fetchRequestsForListing,
  fetchListing,
  acceptRequest,
  markPaymentReceived,
} from "@/lib/api";

export default function CollectorListingRequestsPage() {
  const { listingId } = useParams();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [listing, setListing] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    (async () => {
      // 1️⃣ load the listing and its requests
      const [l, reqs] = await Promise.all([
        fetchListing(listingId),
        fetchRequestsForListing(listingId),
      ]);
      // only show corp‐type requests
      const corpReqs = reqs.filter((r) => r.type === "corporation");
      setListing(l);
      setRequests(corpReqs);
      setLoading(false);
    })();
  }, [sessionLoading, listingId]);

  const handleAccept = async (reqId, loc, contact) => {
    await acceptRequest(reqId, loc, contact);
    setRequests((rs) =>
      rs.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: "accepted",
              pickupLocation: loc,
              contactNumber: contact,
            }
          : r
      )
    );
  };

  const handlePayment = async (reqId) => {
    await markPaymentReceived(reqId);
    setRequests((rs) =>
      rs.map((r) => (r.id === reqId ? { ...r, status: "payment_received" } : r))
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
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-4">
        "{listing.title}" – Corporation Requests
      </h1>

      {requests.length === 0 && (
        <p className="text-gray-600">No corporation has requested this yet.</p>
      )}

      <div className="space-y-6">
        {requests.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col space-y-3"
          >
            <p>
              <strong>Corporation:</strong> {r.collectorId}
            </p>
            <p>
              <strong>Status:</strong> {r.status}
            </p>

            {r.status === "pending" && (
              <AcceptForm req={r} onAccept={handleAccept} />
            )}

            {r.status === "accepted" && (
              <div className="space-y-1">
                <p>
                  <strong>Pickup Location:</strong> {r.pickupLocation}
                </p>
                <p>
                  <strong>Contact:</strong> {r.contactNumber}
                </p>
              </div>
            )}

            {r.status === "picked_up" && (
              <button
                onClick={() => handlePayment(r.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Mark Payment Received
              </button>
            )}

            {r.status === "payment_received" && (
              <span className="px-3 py-1 bg-gray-400 text-white rounded">
                Completed
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AcceptForm({ req, onAccept }) {
  const [loc, setLoc] = useState("");
  const [contact, setContact] = useState("");

  return (
    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
      <input
        placeholder="Pickup Location"
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        className="flex-1 border rounded px-3 py-2"
      />
      <input
        placeholder="Contact #"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="w-full sm:w-40 border rounded px-3 py-2"
      />
      <button
        onClick={() => onAccept(req.id, loc, contact)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Accept
      </button>
    </div>
  );
}
