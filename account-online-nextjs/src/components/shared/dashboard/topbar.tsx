"use client";

import { LogOut, Menu, User, ChevronDown, KeyRound, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutToken } from "@/utils/local-storage/token";
import { logoutRole } from "@/utils/local-storage/roles";
import { clearUserInfo, getUserInfo } from "@/utils/local-storage/userInfo";
import LanguageSwitcher from "../common/language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { cn } from "@/lib/utils";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations();

  const user = getUserInfo();
  const profileImageUrl = user?.profileUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${user.profileUrl}`
    : "";
  const displayName = user?.fullName || user?.email || "User";
  const initials = (user?.fullName || user?.email || "U").charAt(0).toUpperCase();

  async function handleLogout() {
    setIsLoggingOut(true);
    // Small delay so the spinner is visible before navigation
    await new Promise((r) => setTimeout(r, 600));
    logoutToken();
    logoutRole();
    clearUserInfo();
    router.replace(ROUTES.AUTH.LOGIN);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3 flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="hover:bg-accent rounded-lg transition-all duration-200 active:scale-95"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <Link
            href={ROUTES.DASHBOARD.INDEX}
            className="flex items-center gap-3 group transition-all duration-200"
          >
            <img
              src={AppIcons.APP.CPBANK}
              alt="CP Bank"
              className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Right: theme, language, profile dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageSwitcher />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8 border border-border shadow-sm">
                  <AvatarImage src={profileImageUrl} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {displayName}
                  </span>
                  {user?.userRole && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {user.userRole.toLowerCase()}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={ROUTES.DASHBOARD.PROFILE} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`${ROUTES.DASHBOARD.PROFILE}?tab=password`}
                  className="cursor-pointer"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                onSelect={() => setShowLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Logout Confirmation Dialog ── */}
      <Dialog open={showLogoutDialog} onOpenChange={(open) => { if (!isLoggingOut) setShowLogoutDialog(open); }}>
        <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-destructive" />

          <div className="p-6">
            <DialogHeader className="items-center text-center space-y-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Logout Confirmation
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to sign out? You will need to log in
                  again to access your account.
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutDialog(false)}
                disabled={isLoggingOut}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Yes, Sign Out
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
