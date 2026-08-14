"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/sources", label: "Sources" },
  { href: "/jobs", label: "Jobs" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-card-static shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">JigSaw</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary-light"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-primary/10 rounded-lg" />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button className="btn-ghost text-sm">Sign In</button>
            <button className="btn-primary text-sm !px-5 !py-2">
              Get Started
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-bg-elevated/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-card-static border-t border-border animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary-light"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 space-y-2">
              <button className="w-full btn-ghost text-sm">Sign In</button>
              <button className="w-full btn-primary text-sm">Get Started</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
