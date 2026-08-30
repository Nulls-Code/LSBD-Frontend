"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Menu, X, ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 text-[#08254a] shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10  flex items-center justify-center text-[#079447] group-hover:scale-105 transition-transform">
            <Star className="size-6 fill-[#079447]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#08254a] leading-none">
              LOGISTIC
            </span>
            <span className="font-bold text-xs tracking-wider text-[#079447] uppercase mt-0.5">
              STAR BD LTD.
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#11233f]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="hover:text-[#079447] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Get a Quote Button */}
        <div className="hidden md:flex items-center">
          <Button
            asChild
            className="bg-[#079447] hover:bg-[#067a3a] text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-[#079447]/20 flex items-center gap-2"
          >
            <Link href="#request-quote">
              Get a Quote
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#08254a]"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={closeMobileMenu}
              className="block text-[#08254a] font-medium hover:text-[#079447]"
            >
              {link.label}
            </Link>
          ))}
          <Button
            asChild
            className="w-full bg-[#079447] hover:bg-[#067a3a] text-white font-bold py-2.5 rounded-xl"
          >
            <Link href="#request-quote">Get a Quote</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
