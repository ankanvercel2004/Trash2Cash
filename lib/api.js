import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

// ——— Listings ———
export async function fetchOpenListings() {
  const q = query(collection(db, "listings"), where("status", "==", "open"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateListingStatus(listingId, status) {
  const ref = doc(db, "listings", listingId);
  await updateDoc(ref, { status });
}

// ——— Requests ———
export async function createRequest({ listingId, collectorId, type }) {
  return addDoc(collection(db, "requests"), {
    listingId,
    collectorId,
    type,
    status: "pending",
    timestampCreated: Date.now(),
  });
}

export async function fetchRequestsByCollector(uid) {
  const q = query(collection(db, "requests"), where("collectorId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchRequestsForListing(listingId) {
  const q = query(
    collection(db, "requests"),
    where("listingId", "==", listingId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function acceptRequest(requestId, pickupLocation, contactNumber) {
  const ref = doc(db, "requests", requestId);
  await updateDoc(ref, {
    status: "accepted",
    pickupLocation,
    contactNumber,
    timestampAccepted: Date.now(),
  });
}

export async function markPickedUp(requestId) {
  const ref = doc(db, "requests", requestId);
  await updateDoc(ref, { status: "picked_up", timestampPickedUp: Date.now() });
}

export async function markPaymentReceived(requestId) {
  const ref = doc(db, "requests", requestId);
  await updateDoc(ref, {
    status: "payment_received",
    timestampPaid: Date.now(),
  });
}
export async function fetchHomeownerListings(homeownerId) {
  const listingsCol = collection(db, "listings");
  const q = query(listingsCol, where("homeownerId", "==", homeownerId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
/**
 * Create a new waste listing
 * @param {object} params
 * @param {string} params.homeownerId
 * @param {string} params.title
 * @param {string} params.description
 * @param {number} params.price
 * @param {string} params.wasteType
 * @param {string} params.imageUrl      ← include this!
 */
export async function createListing({
  homeownerId,
  title,
  description,
  price,
  wasteType,
  imageUrl, // ← new
}) {
  const listingsCol = collection(db, "listings");
  const docRef = await addDoc(listingsCol, {
    homeownerId,
    title,
    description,
    price,
    wasteType,
    imageUrl, // ← write it here
    status: "open",
    timestampCreated: Date.now(),
  });
  return docRef.id;
}
/**
 * Fetch a single listing by its ID
 * @param {string} listingId
 * @returns {Promise<{id: string, title: string, description: string, price: number, wasteType: string, imageUrl?: string, status: string, ...}>}
 */
export async function fetchListing(listingId) {
  const ref = doc(db, "listings", listingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Listing not found");
  }
  return { id: snap.id, ...snap.data() };
}
export async function updateListing(listingId, updates) {
  const ref = doc(db, "listings", listingId);
  await updateDoc(ref, updates);
}

export async function deleteListing(listingId) {
  // optionally cascade-delete requests first
  await deleteRequestsForListing(listingId);
  await deleteDoc(doc(db, "listings", listingId));
}

// helper to delete all requests for a listing
export async function deleteRequestsForListing(listingId) {
  const q = query(
    collection(db, "requests"),
    where("listingId", "==", listingId)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

// ——— Requests ———
export async function updateRequest(requestId, updates) {
  const ref = doc(db, "requests", requestId);
  await updateDoc(ref, updates);
}

export async function deleteRequest(requestId) {
  await deleteDoc(doc(db, "requests", requestId));
}

export async function fetchCollectorListings() {
  const q = query(collection(db, "listings"), where("status", "==", "open"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}