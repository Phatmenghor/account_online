"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/shared/dashboard/dashboard-sidebar";
import { TopBar } from "@/components/shared/dashboard/topbar";
import { isAuthenticated } from "@/utils/local-storage/token";
import { getRoles } from "@/utils/local-storage/roles";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { getUserProfileService } from "@/features/user/services/user.service";
import { storeUserInfo } from "@/utils/local-storage/userInfo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  // Guard: block unauthenticated users and STAFF from all dashboard pages
  useEffect(() => {
    if (!isAuthenticated() || getRoles() === "STAFF") {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [pathname, router]);

  // On mount: fetch fresh profile to catch admin-reset or expired-password situations
  useEffect(() => {
    if (!isAuthenticated() || getRoles() === "STAFF") return;
    getUserProfileService()
      .then((user) => {
        if (!user) return;
        storeUserInfo(user);
        if (user.forcePasswordChange || user.passwordExpired) {
          router.replace(ROUTES.AUTH.LOGIN);
        }
      })
      .catch(() => {});
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Fixed, no scroll */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area - Flex column with scroll only in content */}
      <div
        className={cn(
          "flex flex-1 flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* TopBar - Fixed at top, no scroll */}
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content - ONLY THIS SCROLLS */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2.5 sm:px-4 sm:py-3">
          <div className="mx-auto text-xs sm:text-xs md:text-sm max-w-[1600px] [zoom:0.9] sm:[zoom:0.92] md:[zoom:0.95]">{children}</div>
        </main>
      </div>
    </div>
  );
}

