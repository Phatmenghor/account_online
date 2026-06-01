"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown, Building2, Briefcase } from "lucide-react";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { logoutToken } from "@/utils/local-storage/token";
import { logoutRole } from "@/utils/local-storage/roles";
import { UserModel } from "@/models/user/user.response";
import LanguageSwitcher from "@/components/shared/common/language-switcher";

export const PageHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserModel | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logoutToken();
    logoutRole();
    router.replace("/login");
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.idCard?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img src="/app/CP-bank-Logo.png" alt="CP Bank" className="h-9 sm:h-11 w-auto object-contain" />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="flag-only" />

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">{initials}</span>
                </div>
                {/* Name — hidden on mobile */}
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-gray-800 max-w-[140px] truncate">
                    {user.fullName || user.idCard}
                  </span>
                  <span className="text-[10px] text-gray-400">{user.userRole}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3.5 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-sm font-bold text-primary-foreground">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName || user.idCard}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || user.idCard}</p>
                      </div>
                    </div>
                  </div>

                  {/* User details */}
                  <div className="px-4 py-3 space-y-2 border-b border-gray-100">
                    {user.position && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{user.position}</span>
                      </div>
                    )}
                    {user.idCard && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{user.idCard}</span>
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
