"use client";

import LanguageSwitcher from "@/components/shared/common/language-switcher";

export function TopBarAuth() {
  return (
    <div className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3 justify-between flex-1">
        <div className="flex items-center">
          <img src="/app/CP-bank-Logo.png" alt="Bank Logo" className="h-12" />
        </div>
      </div>
    </div>
  );
}
