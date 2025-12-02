"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Fourth & Goal
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/upload")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload
            </Link>
            <Link
              href="/analysis"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/analysis")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/lineup"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/lineup")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Lineup
            </Link>
            <Link
              href="/waiver"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive("/waiver")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Waiver Wire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
