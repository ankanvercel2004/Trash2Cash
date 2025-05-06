"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path if needed
import { useSession } from "@/contexts/SessionContext";

export default function DashboardRouter() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectByRole = async () => {
      if (!loading && user) {
        try {
          const profileRef = doc(db, "profiles", user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const userType = profileSnap.data().userType;

            switch (userType) {
              case "homeowner":
                router.push("/dashboard/homeowner");
                break;
              case "collector":
                router.push("/dashboard/collector");
                break;
              case "corporation":
                router.push("/dashboard/corporation");
                break;
              default:
                setError("Unknown user role.");
                break;
            }
          } else {
            setError("User profile not found.");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("An error occurred while redirecting.");
        }
      }
    };

    redirectByRole();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return null;
}
