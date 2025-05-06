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
    // 1) accept the request
    await acceptRequest(reqId, loc, contact);
    // 2) mark the listing as sold
    await updateListingStatus(listingId, "sold");
    // 3) update local state
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

// ——————————————————————————————————————————
// AcceptForm with validation:
// ——————————————————————————————————————————
function AcceptForm({ req, onAccept }) {
  const [loc, setLoc] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState({});

  // Validate fields and call onAccept only when valid
  const handleClick = () => {
    const errs = {};

    // Location required
    if (!loc.trim()) {
      errs.loc = "Pickup location is required.";
    }

    // Contact number must be exactly 10 digits
    const digitsOnly = contact.replace(/\D/g, "");
    if (!contact.trim()) {
      errs.contact = "Contact number is required.";
    } else if (!/^\d{10}$/.test(digitsOnly)) {
      errs.contact = "Contact must be exactly 10 digits.";
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // no errors → clear and proceed
    setErrors({});
    onAccept(req.id, loc.trim(), digitsOnly);
  };

  return (
    <div className="mt-3 space-y-2">
      <div>
        <input
          placeholder="Pickup Location"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className={`w-full border rounded px-3 py-2 focus:outline-none ${
            errors.loc ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.loc && (
          <p className="mt-1 text-red-600 text-sm">{errors.loc}</p>
        )}
      </div>

      <div>
        <input
          placeholder="Contact #"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={`w-full border rounded px-3 py-2 focus:outline-none ${
            errors.contact ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.contact && (
          <p className="mt-1 text-red-600 text-sm">{errors.contact}</p>
        )}
      </div>

      <button
        onClick={handleClick}
        className="mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
      >
        Accept
      </button>
    </div>
  );
}
