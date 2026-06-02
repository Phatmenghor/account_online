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
import { getUserProfileService } from "@/services/dashboard/user/user.service";
import { storeUserInfo } from "@/utils/local-storage/userInfo";
import ForceChangePasswordModal from "@/components/shared/modal/force-change-password-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForceChange, setShowForceChange] = useState(false);
  const [forceChangeReason, setForceChangeReason] = useState<"force" | "expired">("force");
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
        if (user.forcePasswordChange) {
          setForceChangeReason("force");
          setShowForceChange(true);
        } else if (user.passwordExpired) {
          setForceChangeReason("expired");
          setShowForceChange(true);
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

  function handleForceChangeSuccess() {
    setShowForceChange(false);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ForceChangePasswordModal
        isOpen={showForceChange}
        reason={forceChangeReason}
        onSuccess={handleForceChangeSuccess}
      />
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto ">{children}</div>
        </main>
      </div>
    </div>
  );
}
