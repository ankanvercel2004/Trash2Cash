"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/SessionContext";
import {
  fetchOpenListings,
  fetchRequestsByCollector,
  fetchHomeownerListings,
} from "@/lib/api";
import {
  FaPlusCircle,
  FaList,
  FaTrashAlt,
  FaClipboardList,
} from "react-icons/fa";

export default function CollectorDashboard() {
  const { user, loading: sessionLoading } = useSession();
  const [homeCount, setHomeCount] = useState(0);
  const [reqCount, setReqCount] = useState(0);
  const [myCount, setMyCount] = useState(0);

  useEffect(() => {
    if (!sessionLoading && user) {
      // Count open homeowner listings
      fetchOpenListings()
        .then((ls) => setHomeCount(ls.length))
        .catch(console.error);
      // Count my requests
      fetchRequestsByCollector(user.uid)
        .then((rs) => setReqCount(rs.length))
        .catch(console.error);
      // Count my own listings as a collector
      fetchHomeownerListings(user.uid)
        .then((ls) => setMyCount(ls.length))
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
      <div className="bg-blue-100 p-6 rounded-xl shadow mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Collector Dashboard
        </h1>
        <p className="text-blue-800 text-lg">Choose an action below:</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard
          title="Add Corp Listing"
          description="Post waste for corporations"
          icon={<FaPlusCircle className="text-3xl text-blue-700" />}
          href="/dashboard/collector/listings/new"
        />
        <ActionCard
          title="My Listings"
          description={`${myCount} total`}
          icon={<FaList className="text-3xl text-blue-700" />}
          href="/dashboard/collector/listings"
        />
        <ActionCard
          title="Browse Homeowner Listings"
          description={`${homeCount} available`}
          icon={<FaTrashAlt className="text-3xl text-blue-700" />}
          href="/dashboard/collector/discover"
        />
        <ActionCard
          title="My Requests"
          description={`${reqCount} sent`}
          icon={<FaClipboardList className="text-3xl text-blue-700" />}
          href="/dashboard/collector/requests"
        />
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon, href }) {
  return (
    <Link
      href={href}
      className="bg-white hover:bg-blue-50 p-6 rounded-xl shadow flex flex-col justify-between transition border border-transparent hover:border-blue-300"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-blue-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}
