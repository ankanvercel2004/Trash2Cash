// app/dashboard/homeowner/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchHomeownerListings, fetchRequestsForListing } from "@/lib/api";
import { FaPlusCircle, FaTrash, FaClipboardList } from "react-icons/fa";

export default function HomeownerDashboard() {
  const { user, loading } = useSession();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [requestsCount, setRequestsCount] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      const init = async () => {
        // 1️⃣ Fetch homeowner profile for name
        const snap = await getDoc(doc(db, "profiles", user.uid));
        if (snap.exists()) setProfile(snap.data());

        // 2️⃣ Fetch this user’s listings
        const fetched = await fetchHomeownerListings(user.uid);
        setListings(fetched);

        // 3️⃣ Count all requests across those listings
        let total = 0;
        await Promise.all(
          fetched.map(async (l) => {
            const reqs = await fetchRequestsForListing(l.id);
            total += reqs.length;
          })
        );
        setRequestsCount(total);
      };
      init();
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome */}
      <div className="bg-green-100 p-6 rounded-xl shadow mb-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2">
          Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
        </h1>
        <p className="text-green-800 text-lg">
          Here’s your dashboard overview.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <ActionCard
          title="Upload New Waste"
          description="Add items for collection."
          icon={<FaPlusCircle className="text-3xl text-green-700" />}
          href="/upload"
        />
        <ActionCard
          title="My Listings"
          description={`${listings.length} active`}
          icon={<FaTrash className="text-3xl text-green-700" />}
          href="/dashboard/homeowner/listings"
        />
        <ActionCard
          title="Requests"
          description={`${requestsCount} total`}
          icon={<FaClipboardList className="text-3xl text-green-700" />}
          href="/dashboard/homeowner/listings"
        />
      </div>

      {/* Recent Listings */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Recent Listings
        </h2>
        <ul className="space-y-4">
          {listings.length ? (
            listings.slice(0, 3).map((l) => (
              <li
                key={l.id}
                className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between"
              >
                <span className="font-medium text-gray-700">{l.title}</span>
                <span className="text-sm text-gray-500">
                  Status: {l.status}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-600">You have no listings yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon, href }) {
  return (
    <Link
      href={href}
      className="bg-white hover:bg-green-50 p-6 rounded-xl shadow flex flex-col justify-between transition duration-200 border border-transparent hover:border-green-300"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-green-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}
