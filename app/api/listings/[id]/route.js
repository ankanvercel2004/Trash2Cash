import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Get a single listing by ID
export async function GET(_, { params }) {
  try {
    const { id } = params;
    const docRef = doc(db, "listings", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ id: docSnap.id, ...docSnap.data() }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// Update listing (alternative to PUT inside route.js if you prefer per-ID updates here)
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    const docRef = doc(db, "listings", id);
    await updateDoc(docRef, data);
    return new Response(JSON.stringify({ message: "Listing updated" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
