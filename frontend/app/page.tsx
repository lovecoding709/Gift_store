"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-valentine-light via-pink-50 to-red-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-valentine-red mb-6">Welcome</h1>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-valentine-pink text-white py-3 rounded-lg font-semibold hover:bg-valentine-red transition-all duration-300"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="block w-full bg-valentine-pink text-white py-3 rounded-lg font-semibold hover:bg-valentine-red transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
