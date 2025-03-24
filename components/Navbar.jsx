"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          Trash2Cash
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-green-600">
            Home
          </Link>
          <Link href="/features" className="text-gray-700 hover:text-green-600">
            Features
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-green-600">
            About
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                {user.displayName || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-gray-700 hover:text-green-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 8h16M4 16h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block text-gray-700 hover:text-green-600">
              Home
            </Link>
            <Link
              href="/features"
              className="block text-gray-700 hover:text-green-600"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="block text-gray-700 hover:text-green-600"
            >
              About
            </Link>
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="block px-4 py-2 bg-green-600 text-white rounded"
                >
                  {user.displayName || "Profile"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
