"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { SidebarUserProfile } from "@/features/user/components/sidebar-profile";
import { UserModel } from "@/features/user/types/user.response";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import { getUserProfileService } from "@/features/user/services/user.service";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoles } from "@/utils/local-storage/roles";
import {
  STATIC_MENU,
  StaticMenuItem,
  RoleEnum,
} from "@/constants/menu/static-menu";

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function filterMenuByRole(
  items: StaticMenuItem[],
  role: RoleEnum,
): StaticMenuItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children
        ? filterMenuByRole(item.children, role)
        : undefined,
    }));
}

export function DashboardSidebar({
  isOpen = true,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [authUser, setAuthUser] = useState<UserModel | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [menuItems, setMenuItems] = useState<StaticMenuItem[]>([]);

  // Resolve role and menu only on client to avoid hydration mismatch
  useEffect(() => {
    const role = (getRoles() ?? "") as RoleEnum;
    const items = filterMenuByRole(STATIC_MENU, role);
    setMenuItems(items);

    // Auto-expand submenus containing current path, or all by default
    const expanded: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        expanded[item.title] =
          item.children.some((c) => c.href && pathname.startsWith(c.href)) ||
          true;
      }
    });
    setOpenSubmenus(expanded);
    setMounted(true);
  }, [pathname]);

  useEffect(() => {
    getUserProfileService()
      .then((u) => setAuthUser(u ?? null))
      .finally(() => setIsLoadingUser(false));
  }, []);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "flex flex-col border-r bg-card shadow-sm transition-all duration-300 ease-in-out flex-shrink-0 h-screen z-40 relative",
          isMobile ? "fixed inset-y-0 left-0 z-50 w-64" : isOpen ? "w-64" : "w-16",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-3.5 relative">
          {isOpen ? (
            <Link
              href={ROUTES.DASHBOARD.INDEX}
              className="flex items-center gap-2.5"
            >
              <img
                src={AppIcons.APP.APP_LOGO}
                alt="Logo"
                className="w-9 h-9 flex-shrink-0"
              />
              <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                Account Online
              </span>
            </Link>
          ) : (
            <Link
              href={ROUTES.DASHBOARD.INDEX}
              className="flex items-center justify-center w-full"
            >
              <img src={AppIcons.APP.APP_LOGO} alt="Logo" className="w-9 h-9" />
            </Link>
          )}

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent transition-all duration-200",
                !isOpen && "rotate-180",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3 pb-6">
          <nav className={cn("grid gap-1 pb-4", isOpen ? "px-3" : "px-1.5")}>
            {mounted &&
              menuItems.map((item) => (
                <div key={item.title} className="flex flex-col">
                  {item.children && item.children.length > 0 ? (
                    <>
                      {/* Parent with children */}
                      {isOpen ? (
                        <div
                          className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => toggleSubmenu(item.title)}
                        >
                          {item.icon && (
                            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="flex-1 truncate">{item.title}</span>
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground",
                              openSubmenus[item.title] &&
                                "rotate-90 text-primary",
                            )}
                          />
                        </div>
                      ) : (
                        <div className="flex h-9 w-full items-center justify-center rounded-lg px-2 hover:bg-primary/10 hover:text-primary transition-colors group relative">
                          {item.icon && (
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="absolute left-full ml-2 px-2.5 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {item.title}
                          </div>
                        </div>
                      )}

                      {/* Sub-routed Items List with Dotted Primary Tree Guide Line */}
                      {isOpen && openSubmenus[item.title] && (
                        <div className="ml-4 flex flex-col gap-0.5 my-0.5 pl-2 border-l-[1.5px] border-dashed border-primary/45 dark:border-primary/60 animate-in slide-in-from-top-1 duration-200">
                          {item.children.map((child) => {
                            const isActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href ?? "#"}
                                className={cn(
                                  "group relative flex h-8 items-center rounded-md px-2 text-xs font-medium transition-all duration-150",
                                  isActive
                                    ? "bg-primary text-white font-semibold shadow-xs"
                                    : "text-gray-600 hover:bg-primary/10 hover:text-primary",
                                )}
                              >
                                {/* Dotted Primary Branch Horizontal Connector */}
                                <span
                                  className={cn(
                                    "absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 border-t-[1.5px] border-dashed transition-colors",
                                    isActive
                                      ? "border-primary"
                                      : "border-primary/45 group-hover:border-primary",
                                  )}
                                />
                                {/* Primary Bullet Dot Indicator */}
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0 mr-1.5 transition-all duration-150",
                                    isActive
                                      ? "bg-white scale-110"
                                      : "bg-primary/50 group-hover:bg-primary group-hover:scale-110",
                                  )}
                                />
                                <span className="truncate">{child.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Leaf item */
                    (() => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          href={item.href ?? "#"}
                          className={cn(
                            "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs sm:text-sm font-medium transition-colors group relative",
                            isActive
                              ? "bg-primary text-white font-semibold shadow-xs"
                              : "text-gray-700 hover:bg-primary/10 hover:text-primary",
                            !isOpen && "justify-center",
                          )}
                        >
                          {item.icon && (
                            <item.icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive
                                  ? "text-white"
                                  : "text-muted-foreground",
                              )}
                            />
                          )}
                          {isOpen && (
                            <span className="truncate">{item.title}</span>
                          )}
                          {!isOpen && (
                            <div className="absolute left-full ml-2 px-2.5 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                              {item.title}
                            </div>
                          )}
                        </Link>
                      );
                    })()
                  )}
                </div>
              ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
