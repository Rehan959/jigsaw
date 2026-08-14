"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/sources", label: "Sources" },
  { href: "/jobs", label: "Jobs" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const [showNavbar, setShowNavbar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setShowNavbar(latest > 0.05);
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Static nav for mobile */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-4 py-3 md:hidden" aria-label="Main navigation">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center space-x-2" aria-label="JigSaw home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">JigSaw</span>
          </Link>
          <Button asChild size="sm">
            <Link href="/search">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Floating nav (appears on scroll on desktop) */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={showNavbar ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="fixed top-4 z-50 hidden md:flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border border-border rounded-2xl w-[90%] lg:w-[80%] mx-auto left-1/2 -translate-x-1/2"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center space-x-2" aria-label="JigSaw home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Search className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">JigSaw</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors duration-200 hover:text-foreground ${
                  isActive ? "text-foreground" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/search">Get Started</Link>
          </Button>
        </div>
      </motion.nav>

      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-6 md:hidden"
          role="menu"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 mt-1 border-t border-border">
              <Button asChild className="w-full">
                <Link href="/search" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
