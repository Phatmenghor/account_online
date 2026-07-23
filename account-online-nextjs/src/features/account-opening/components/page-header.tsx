"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  ChevronDown,
  KeyRound,
  Loader2,
} from "lucide-react";
import { getUserInfo } from "@/utils/local-storage/userInfo";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { logoutToken } from "@/utils/local-storage/token";
import { logoutRole } from "@/utils/local-storage/roles";
import { UserModel } from "@/features/user/types/user.response";
import LanguageSwitcher from "@/components/shared/common/language-switcher";
import { ROUTES } from "@/constants/AppRoutes/routes";
import Link from "next/link";
import { useTranslations } from "next-intl";

export const PageHeader = () => {
  const router = useRouter();
  const translate = useTranslations("common");
  const [user, setUser] = useState<UserModel | null>(null);
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  async function handleLogout() {
    setIsLoggingOut(true);
    await new Promise((r) => setTimeout(r, 600));
    logoutToken();
    logoutRole();
    clearUserInfo();
    router.replace(ROUTES.AUTH.LOGIN);
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.idCard?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
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
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{initials}</span>
                  </div>
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
                        </div>
                      </div>
                    </div>

                    {/* Navigation items */}
                    <div className="p-2 border-b border-gray-100 space-y-0.5">
                      <Link
                        href={ROUTES.MY_PROFILE}
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 font-medium"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        {translate("myProfile")}
                      </Link>
                      <Link
                        href={`${ROUTES.MY_PROFILE}?tab=password`}
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 font-medium"
                      >
                        <KeyRound className="w-4 h-4 text-gray-400" />
                        {translate("changePassword")}
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="p-2">
                      <button
                        onClick={() => { setOpen(false); setShowLogout(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        {translate("signOut")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!isLoggingOut) setShowLogout(false); }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Red accent bar */}
            <div className="h-1.5 w-full bg-red-500" />

            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <LogOut className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{translate("logoutConfirmTitle")}</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  {translate("logoutConfirmMessage")}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowLogout(false)}
                  disabled={isLoggingOut}
                  className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {translate("cancel")}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {translate("signingOut")}
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      {translate("yesSignOut")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


