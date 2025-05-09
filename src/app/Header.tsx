"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex justify-center bg-transparent pt-6 pb-4">
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between bg-white rounded-2xl shadow-md px-8 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-3xl font-headline text-solace-green tracking-tight">Solace</span>
        </Link>
        {/* Nav Links */}

        {/* Actions */}
        <div className="flex items-center gap-4">
    
          <Link href="#search" className="bg-solace-green text-text-color-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-solace-green/90 transition">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}