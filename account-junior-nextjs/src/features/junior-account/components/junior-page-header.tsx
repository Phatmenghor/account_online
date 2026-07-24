"use client";

import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/shared/common/language-switcher";

/**
 * Minimal public navbar for the Junior Account Opening page.
 * Shows only the CPBank logo + language switcher.
 * No user profile, no logout, no service links — this is a public form.
 */
export const JuniorPageHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled
          ? "shadow-md shadow-slate-200/50 border-b border-slate-200/60"
          : "border-b border-slate-100"
      }`}
    >
      <div
        className={`max-w-5xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between gap-3 transition-all duration-300 ${
          scrolled ? "py-2 sm:py-2.5" : "py-2.5 sm:py-3.5"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img
            src="/app/CP-bank-Logo.png"
            alt="CP Bank"
            className="h-9 sm:h-11 w-auto object-contain"
          />
        </div>

        {/* Right side — language switcher only */}
        <div className="flex items-center">
          <LanguageSwitcher variant="flag-only" />
        </div>
      </div>
    </header>
  );
};
