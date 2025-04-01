import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden bg-gradient-to-br from-green-50 via-white to-emerald-100 min-h-screen">
        {/* Background Animated Blobs */}
        <div className="pointer-events-none fixed top-[-5rem] left-[-5rem] w-96 h-96 bg-green-300 opacity-20 blur-3xl rounded-full animate-blob animation-delay-2000 z-0" />
        <div className="pointer-events-none fixed bottom-[-5rem] right-[-5rem] w-96 h-96 bg-emerald-400 opacity-20 blur-3xl rounded-full animate-blob z-0" />

        {/* Main App Content */}
        <div className="relative z-10">
          <SessionProvider>
            <Navbar />
            {children}
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
