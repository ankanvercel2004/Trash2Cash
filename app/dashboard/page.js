"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState("homeowner");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  // Fetch user type from the "profiles" collection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      async function fetchUserType() {
        try {
          const q = query(
            collection(db, "profiles"),
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            // Expected values: "homeowner", "collector", or "corporation"
            setUserType(data.userType || "homeowner");
            console.log("Fetched user type:", data.userType);
          } else {
            setUserType("homeowner");
            console.log("No profile found; defaulting to homeowner");
          }
        } catch (err) {
          console.error("Error fetching user type:", err);
          setError("Error fetching user type");
        }
      }
      fetchUserType();
    }
  }, [user, loading, router]);

  // Fetch listings based on userType
  useEffect(() => {
    if (user) {
      async function fetchListings() {
        try {
          const listingsRef = collection(db, "listings");
          let q;
          if (userType === "homeowner") {
            // Homeowners see only their own listings.
            q = query(listingsRef, where("userId", "==", user.uid));
            console.log(
              "Querying listings for homeowner with userId =",
              user.uid
            );
          } else if (userType === "collector") {
            // Collectors see listings from homeowners and collectors.
            q = query(
              listingsRef,
              where("ownerType", "in", ["homeowner", "collector"])
            );
            console.log(
              "Querying listings for collector: ownerType in [homeowner, collector]"
            );
          } else if (userType === "corporation") {
            // Corporations see only listings from collectors.
            q = query(listingsRef, where("ownerType", "==", "collector"));
            console.log(
              "Querying listings for corporation: ownerType equals collector"
            );
          } else {
            // Fallback: show everything.
            q = query(listingsRef);
            console.log("Fallback query: fetching all listings");
          }
          const querySnapshot = await getDocs(q);
          const listingsArr = [];
          querySnapshot.forEach((doc) => {
            listingsArr.push({ id: doc.id, ...doc.data() });
          });
          console.log("Fetched listings:", listingsArr);
          setListings(listingsArr);
        } catch (err) {
          console.error("Error fetching listings:", err);
          setError("Error fetching listings");
        }
      }
      fetchListings();
    }
  }, [user, userType]);

  // Fetch transactions based on userType
  useEffect(() => {
    if (user) {
      async function fetchTransactions() {
        try {
          const transactionsRef = collection(db, "transactions");
          let q;
          if (userType === "homeowner") {
            q = query(transactionsRef, where("userId", "==", user.uid));
          } else if (userType === "collector") {
            q = query(transactionsRef, where("collectorId", "==", user.uid));
          } else if (userType === "corporation") {
            q = query(transactionsRef, where("corporationId", "==", user.uid));
          } else {
            q = query(transactionsRef);
          }
          const querySnapshot = await getDocs(q);
          const transactionsArr = [];
          querySnapshot.forEach((doc) => {
            transactionsArr.push({ id: doc.id, ...doc.data() });
          });
          setTransactions(transactionsArr);
        } catch (err) {
          console.error("Error fetching transactions:", err);
          setError("Error fetching transactions");
        }
      }
      fetchTransactions();
    }
  }, [user, userType]);

  // Modal handlers
  const openDeleteModal = (listingId) => {
    setListingToDelete(listingId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch("/api/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listingToDelete }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to delete listing.");
      } else {
        setListings(listings.filter((l) => l.id !== listingToDelete));
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Error deleting listing.");
    }
    setShowModal(false);
    setListingToDelete(null);
  };

  const cancelDelete = () => {
    setShowModal(false);
    setListingToDelete(null);
  };

  const handleUpdateListing = (listingId) => {
    router.push(`/listings/edit/${listingId}`);
  };

  // Chat function:
  // - For a collector: If viewing a listing from a homeowner, show Chat.
  // - For a corporation: If viewing a listing from a collector, show Chat.
  const handleChat = (ownerId) => {
    router.push(`/chat?target=${ownerId}`);
  };

  const handleImageClick = (imageData) => {
    setSelectedImage(imageData);
    setShowModal(true);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Animated Background Blobs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse z-0" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse z-0" />

      <div className="relative min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-white p-6 transition-all duration-500">
        <div className="container mx-auto z-10 relative">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 fade-in">
            <div>
              <h1 className="text-4xl font-bold text-green-900">
                Welcome, {user.displayName || "User"}!
              </h1>
              <p className="text-gray-600 mt-2">
                Role: {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </p>
              <p className="text-gray-600 mt-2">
                Here’s an overview of your dashboard.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {/* Show "Add Listing" button for homeowners and collectors */}
              {(userType === "homeowner" || userType === "collector") && (
                <button
                  onClick={() => router.push("/listings/add")}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition shadow"
                >
                  Add Listing
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              ["Total Listings", listings.length],
              ["Total Transactions", transactions.length],
            ].map(([title, count], idx) => (
              <Card
                key={idx}
                className="hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-2xl fade-in"
              >
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-green-700">
                  {count}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Listings Section */}
          {userType === "collector" || userType === "corporation" ? (
            // Available Listings for collectors and corporations
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-green-800 mb-4 fade-in">
                Available Listings
              </h2>
              {error && (
                <p className="text-red-600 text-center text-sm mb-4">{error}</p>
              )}
              {listings.length === 0 ? (
                <p className="text-gray-700">No listings available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="transition-all duration-300 hover:scale-[1.02] fade-in"
                    >
                      <Card className="bg-white/90 backdrop-blur-sm border border-green-100">
                        <CardHeader className="flex justify-between items-center">
                          <CardTitle>{listing.title}</CardTitle>
                          <div className="flex space-x-2">
                            {listing.userId === user.uid ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateListing(listing.id)
                                  }
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  &#9998;
                                </button>
                                <button
                                  onClick={() => openDeleteModal(listing.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  &#128465;
                                </button>
                              </>
                            ) : (
                              // Show Chat button when conditions are met:
                              // - For a collector: if listing.ownerType is "homeowner"
                              // - For a corporation: if listing.ownerType is "collector"
                              ((userType === "collector" &&
                                listing.ownerType === "homeowner") ||
                                (userType === "corporation" &&
                                  listing.ownerType === "collector")) && (
                                <button
                                  onClick={() => handleChat(listing.userId)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
                                  title="Chat"
                                >
                                  Chat
                                </button>
                              )
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {listing.imageData && (
                            <img
                              src={listing.imageData}
                              alt={listing.title}
                              className="w-full h-40 object-cover rounded mb-2 cursor-pointer"
                              onClick={() =>
                                handleImageClick(listing.imageData)
                              }
                            />
                          )}
                          <p className="text-gray-700">{listing.description}</p>
                          {listing.ownerType === "homeowner" &&
                            listing.ownerName && (
                              <p className="text-sm text-gray-600">
                                By: {listing.ownerName}
                              </p>
                            )}
                          <p className="mt-2 text-green-600 font-bold">
                            ${listing.price}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Pickup Date: {listing.pickupDate}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            // For Homeowners – Your Listings
            <section className="mb-8">
              <h2 className="text-3xl font-bold text-green-800 mb-4 fade-in">
                Your Listings
              </h2>
              {error && (
                <p className="text-red-600 text-center text-sm mb-4">{error}</p>
              )}
              {listings.length === 0 ? (
                <p className="text-gray-700">No listings available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="transition-all duration-300 hover:scale-[1.02] fade-in"
                    >
                      <Card className="bg-white/90 backdrop-blur-sm border border-green-100">
                        <CardHeader className="flex justify-between items-center">
                          <CardTitle>{listing.title}</CardTitle>
                          <div className="flex space-x-2">
                            {listing.userId === user.uid ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateListing(listing.id)
                                  }
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  &#9998;
                                </button>
                                <button
                                  onClick={() => openDeleteModal(listing.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  &#128465;
                                </button>
                              </>
                            ) : (
                              ((userType === "collector" &&
                                listing.ownerType === "homeowner") ||
                                (userType === "corporation" &&
                                  listing.ownerType === "collector")) && (
                                <button
                                  onClick={() => handleChat(listing.userId)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
                                  title="Chat"
                                >
                                  Chat
                                </button>
                              )
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {listing.imageData && (
                            <img
                              src={listing.imageData}
                              alt={listing.title}
                              className="w-full h-40 object-cover rounded mb-2 cursor-pointer"
                              onClick={() =>
                                handleImageClick(listing.imageData)
                              }
                            />
                          )}
                          <p className="text-gray-700">{listing.description}</p>
                          {listing.ownerType === "homeowner" ||
                            (listing.ownerType === "collector" &&
                              listing.ownerName && (
                                <p className="text-sm text-gray-600">
                                  By: {listing.ownerName}
                                </p>
                              ))}
                          <p className="mt-2 text-green-600 font-bold">
                            ${listing.price}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            Pickup Date: {listing.pickupDate}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Transactions Section */}
          <section>
            <h2 className="text-3xl font-bold text-green-800 mb-4 fade-in">
              Transactions
            </h2>
            {transactions.length === 0 ? (
              <p className="text-gray-700">No transactions found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="transition-all hover:scale-[1.02] fade-in"
                  >
                    <CardHeader>
                      <CardTitle>Transaction ID: {transaction.id}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        Amount: ${transaction.amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date: {transaction.date}
                      </p>
                      <p className="text-gray-700">
                        Status: {transaction.status}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Delete Modal */}
      {showModal && listingToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold text-green-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this listing?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showModal && selectedImage && !listingToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-4 rounded-lg relative max-w-3xl shadow-xl">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              onClick={() => {
                setShowModal(false);
                setSelectedImage(null);
              }}
            >
              &#10005;
            </button>
            <img
              src={selectedImage}
              alt="Full View"
              className="max-h-screen object-contain rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}
