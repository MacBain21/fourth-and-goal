"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#0B1E3D]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
              Fourth & Goal
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                isActive("/")
                  ? "text-[#0B1E3D] bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] shadow-lg shadow-[#26D36B]/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Home
            </Link>
            <Link
              href="/connect"
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                isActive("/connect")
                  ? "text-[#0B1E3D] bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] shadow-lg shadow-[#26D36B]/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Connect ESPN
            </Link>
            <Link
              href="/analysis"
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                isActive("/analysis")
                  ? "text-[#0B1E3D] bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] shadow-lg shadow-[#26D36B]/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/matchup"
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                isActive("/matchup")
                  ? "text-[#0B1E3D] bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] shadow-lg shadow-[#26D36B]/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Matchups
            </Link>
            <Link
              href="/compare"
              className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                isActive("/compare")
                  ? "text-[#0B1E3D] bg-gradient-to-r from-[#26D36B] to-[#1A8CFF] shadow-lg shadow-[#26D36B]/30"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Trades
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
