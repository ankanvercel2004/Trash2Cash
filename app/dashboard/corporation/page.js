"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import { fetchRequestsByCollector, fetchCollectorListings } from "@/lib/api";
import { FaTrashAlt, FaClipboardList } from "react-icons/fa";

export default function CorporationDashboard() {
  const { user, loading: sessionLoading } = useSession();
  const [listingCount, setListingCount] = useState(0);
  const [reqCount, setReqCount] = useState(0);

  useEffect(() => {
    if (!sessionLoading && user) {
      // 1️⃣ Count open listings created by collectors
      fetchCollectorListings()
        .then((ls) => setListingCount(ls.length))
        .catch(console.error);

      // 2️⃣ Count this corporation’s own requests
      fetchRequestsByCollector(user.uid)
        .then((rs) => setReqCount(rs.length))
        .catch(console.error);
    }
  }, [user, sessionLoading]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome */}
      <div className="bg-indigo-100 p-6 rounded-xl shadow mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">
          Corporation Dashboard
        </h1>
        <p className="text-indigo-800 text-lg">
          What would you like to do today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ActionCard
          title="Browse Collector Listings"
          description={`${listingCount} available`}
          icon={<FaTrashAlt className="text-3xl text-indigo-700" />}
          href="/dashboard/corporation/discover"
        />
        <ActionCard
          title="My Requests"
          description={`${reqCount} sent`}
          icon={<FaClipboardList className="text-3xl text-indigo-700" />}
          href="/dashboard/corporation/requests"
        />
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon, href }) {
  return (
    <Link
      href={href}
      className="bg-white hover:bg-indigo-50 p-6 rounded-xl shadow flex flex-col justify-between transition border border-transparent hover:border-indigo-300"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-indigo-800 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}
