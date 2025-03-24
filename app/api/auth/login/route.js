import { db, doc, getDoc } from "@/lib/firebase";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    // Parse JSON body
    const { email, password } = await req.json();

    // Check if user exists in Firestore (example uses "users" collection keyed by email)
    const userDocRef = doc(db, "users", email);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return new Response(JSON.stringify({ error: "User does not exist." }), {
        status: 404,
      });
    }

    // Compare hashed password
    const userData = userSnap.data();
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: "Invalid credentials." }), {
        status: 401,
      });
    }

    // Successful login
    return new Response(JSON.stringify({ message: "Login successful!" }), {
      status: 200,
    });
  } catch (err) {
    // Return JSON for all errors
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
