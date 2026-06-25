"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { SidebarUserProfile } from "@/components/app/profile/sidebar-profile";
import { UserModel } from "@/models/user/user.response";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import { getUserProfileService } from "@/services/dashboard/user/user.service";
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card shadow-lg transition-all duration-300 ease-in-out",
          isMobile ? "w-64" : isOpen ? "w-64" : "w-16",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-3 relative">
          {isOpen ? (
            <Link
              href={ROUTES.DASHBOARD.INDEX}
              className="flex items-center gap-2"
            >
              <img
                src={AppIcons.APP.APP_LOGO}
                alt="Logo"
                className="w-10 h-10"
              />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                Account Online
              </span>
            </Link>
          ) : (
            <Link
              href={ROUTES.DASHBOARD.INDEX}
              className="flex items-center justify-center w-full"
            >
              <img
                src={AppIcons.APP.APP_LOGO}
                alt="Logo"
                className="w-10 h-10"
              />
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
        <ScrollArea className="flex-1 py-2">
          <nav className={cn("grid gap-0.5", isOpen ? "px-2" : "px-1")}>
            {mounted &&
              menuItems.map((item) => (
                <div key={item.title} className="flex flex-col">
                  {item.children && item.children.length > 0 ? (
                    <>
                      {/* Parent with children */}
                      {isOpen ? (
                        <div
                          className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          onClick={() => toggleSubmenu(item.title)}
                        >
                          {item.icon && (
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span className="flex-1">{item.title}</span>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openSubmenus[item.title] && "rotate-90",
                            )}
                          />
                        </div>
                      ) : (
                        <div className="flex h-9 w-full items-center justify-center rounded-md px-2 hover:bg-primary/10 hover:text-primary transition-colors group relative">
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {item.title}
                          </div>
                        </div>
                      )}

                      {isOpen && openSubmenus[item.title] && (
                        <div className="ml-4 flex flex-col gap-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-200">
                          {item.children.map((child) => {
                            const isActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href ?? "#"}
                                className={cn(
                                  "flex h-8 items-center rounded-md px-2 text-sm transition-colors",
                                  isActive
                                    ? "bg-primary/80 text-primary-foreground font-medium"
                                    : "hover:bg-primary/10 hover:text-primary",
                                )}
                              >
                                {child.title}
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
                            "flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors group relative",
                            isActive
                              ? "bg-primary/80 text-primary-foreground"
                              : "hover:bg-primary/10 hover:text-primary",
                            !isOpen && "justify-center",
                          )}
                        >
                          {item.icon && (
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                          )}
                          {isOpen && <span>{item.title}</span>}
                          {!isOpen && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
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

        {/* Footer */}
        <div className="border-t p-3">
          {isLoadingUser ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div
                className={cn(
                  "h-10 bg-slate-200 rounded-md dark:bg-slate-700",
                  isOpen ? "w-full" : "w-10 mx-auto",
                )}
              />
              {isOpen && (
                <div className="h-4 w-3/4 bg-slate-200 rounded-md dark:bg-slate-700" />
              )}
            </div>
          ) : (
            <SidebarUserProfile user={authUser} isOpen={isOpen} />
          )}
        </div>
      </aside>
    </>
  );
}
