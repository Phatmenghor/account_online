"use client";

import { LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutToken } from "@/utils/local-storage/token";
import { logoutRole } from "@/utils/local-storage/roles";
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
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const t = useTranslations();

  const handleLogout = () => {
    logoutToken();
    logoutRole();
    router.replace(ROUTES.AUTH.LOGIN);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
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

          {/* Logo */}
          <Link
            href={ROUTES.DASHBOARD.INDEX}
            className="flex items-center gap-3 group transition-all duration-200"
          >
            <div className="relative">
              <img
                src={AppIcons.APP.CPBANK}
                alt="Special Account"
                className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 justify-end flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutAlert(true)}
            className={cn(
              "group relative overflow-hidden",
              "border-border hover:border-destructive/50",
              "hover:bg-destructive/10 hover:text-destructive",
              "transition-all duration-200 active:scale-95",
              "shadow-sm hover:shadow-md"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </Button>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <LogOut className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Logout Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to logout? You'll need to sign in again to
              access your dashboard and account information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel className="sm:mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
