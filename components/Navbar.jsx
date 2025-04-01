"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSession } from "@/contexts/SessionContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { name: user ? "Dashboard" : "Home", href: user ? "/dashboard" : "/" },
    { name: "About", href: "/about" },
  ];

  const linkStyle = (href) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      pathname === href
        ? "bg-green-700 text-white"
        : "text-white hover:bg-green-600 hover:text-white"
    } transition`;

  return (
    <nav className="bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white tracking-wide">
          Trash2Cash
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={linkStyle(link.href)}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/profile"
                className="px-4 py-2 bg-white text-green-700 font-semibold rounded hover:bg-gray-100 transition"
              >
                {user.displayName || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-700 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-white text-green-700 font-semibold rounded hover:bg-gray-100 transition"
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
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
        <div className="md:hidden bg-green-600 text-white px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block py-2 px-3 rounded ${
                pathname === link.href
                  ? "bg-white text-green-700 font-semibold"
                  : "hover:bg-green-500"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <div className="mt-3 space-y-2">
              <Link
                href="/profile"
                className="block px-4 py-2 bg-white text-green-700 rounded text-center"
              >
                {user.displayName || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-green-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <Link
                href="/login"
                className="block px-4 py-2 border border-white text-white rounded text-center hover:bg-white hover:text-green-700 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 bg-white text-green-700 text-center font-semibold rounded hover:bg-gray-100 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
