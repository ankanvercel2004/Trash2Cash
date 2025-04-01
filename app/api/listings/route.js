import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// Create a new listing
export async function POST(req) {
  try {
    const data = await req.json();
    // data now contains imageData, which is a Base64 string.
    const docRef = await addDoc(collection(db, "listings"), data);
    return new Response(
      JSON.stringify({ message: "Listing created", id: docRef.id }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// Retrieve all listings
export async function GET(req) {
  try {
    const querySnapshot = await getDocs(collection(db, "listings"));
    const listings = [];
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });
    return new Response(JSON.stringify({ listings }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// Update an existing listing
export async function PUT(req) {
  try {
    const { id, ...updateData } = await req.json();
    const docRef = doc(db, "listings", id);
    await updateDoc(docRef, updateData);
    return new Response(JSON.stringify({ message: "Listing updated" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// Delete a listing
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    const docRef = doc(db, "listings", id);
    await deleteDoc(docRef);
    return new Response(JSON.stringify({ message: "Listing deleted" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
