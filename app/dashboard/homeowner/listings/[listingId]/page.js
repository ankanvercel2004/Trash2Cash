// app/dashboard/homeowner/listings/[listingId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";
import {
  fetchRequestsForListing,
  acceptRequest,
  updateListingStatus,
  markPaymentReceived,
  fetchListing,
} from "@/lib/api";

export default function ListingRequestsPage() {
  const { listingId } = useParams();
  const { user, loading: sessionLoading } = useSession();
  const [listing, setListing] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    (async () => {
      const [l, reqs] = await Promise.all([
        fetchListing(listingId),
        fetchRequestsForListing(listingId),
      ]);
      setListing(l);
      setRequests(reqs);
      setLoading(false);
    })();
  }, [sessionLoading, listingId]);

  const handleAccept = async (reqId, loc, contact) => {
    await acceptRequest(reqId, loc, contact);

    await updateListingStatus(listingId, "accepted");
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
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Requests for “{listing.title}”
      </h1>

      {requests.length === 0 && (
        <p className="text-gray-600">No one has requested this yet.</p>
      )}

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-xl shadow">
            <p>
              <strong>Collector:</strong> {r.collectorId}
            </p>
            <p className="mt-1">
              <strong>Status:</strong> {r.status}
            </p>

            {r.status === "pending" && (
              <AcceptForm req={r} onAccept={handleAccept} />
            )}

            {r.status === "accepted" && (
              <div className="mt-2 space-y-1">
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
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Mark Payment Received
              </button>
            )}

            {r.status === "payment_received" && (
              <span className="inline-block mt-2 px-3 py-1 bg-gray-400 text-white rounded">
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
    <div className="mt-3 flex space-x-2">
      <input
        placeholder="Pickup Location"
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
        className="border rounded px-2 py-1 flex-1"
      />
      <input
        placeholder="Contact #"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="border rounded px-2 py-1 w-32"
      />
      <button
        onClick={() => onAccept(req.id, loc, contact)}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Accept
      </button>
    </div>
  );
}
