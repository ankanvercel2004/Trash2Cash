import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, doc, getDoc } from "@/lib/firebase";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", email));
        if (!userDoc.exists()) throw new Error("User not found!");

        const user = userDoc.data();

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Incorrect password!");

        return { id: user.email, name: user.name, email: user.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
