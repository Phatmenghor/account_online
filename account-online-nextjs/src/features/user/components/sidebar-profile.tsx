"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { cn } from "@/lib/utils";
import { UserModel } from "@/features/user/types/user.response";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export function SidebarUserProfile({
  user,
  isOpen,
}: {
  user: UserModel | null;
  isOpen: boolean;
}) {
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const profileImageUrl = user?.profileUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL_IMAGE}${user.profileUrl}`
    : "";

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPhotoPreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPhotoPreview]);

  // Photo preview handlers
  const handlePhotoMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    openTimeoutRef.current = setTimeout(() => {
      setShowPhotoPreview(true);
    }, 600); // 1.5 second delay
  };

  const handlePhotoMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setShowPhotoPreview(false);
    }, 100);
  };

  const handleClosePreview = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setShowPhotoPreview(false);
  };

  const handlePreviewMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={ROUTES.DASHBOARD.PROFILE}
              className={cn(
                "flex items-center gap-1.5 rounded-md p-1 px-1.5 bg-accent/30 hover:bg-accent/50 transition-colors duration-200 cursor-pointer group",
                !isOpen && "justify-center"
              )}
            >
              <div
                onMouseEnter={handlePhotoMouseEnter}
                onMouseLeave={handlePhotoMouseLeave}
              >
                <Avatar className="h-6 w-6 border border-background dark:border-card shadow-2xs group-hover:border-primary/30 transition-all">
                  <AvatarImage src={profileImageUrl} alt="Profile" />
                  <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary font-bold text-[10px]">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {isOpen && (
                <div className="grid gap-0 overflow-hidden leading-none">
                  <div className="text-[11px] font-semibold capitalize truncate text-gray-900 dark:text-white leading-tight">
                    {user?.fullName || "User"}
                  </div>
                  <div className="text-[9.5px] text-muted-foreground truncate max-w-[130px] mt-0.5">
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              )}
            </Link>
          </TooltipTrigger>

          {/* Tooltip only shows when sidebar is collapsed */}
          {!isOpen && (
            <TooltipContent side="right">
              <div className="flex flex-col">
                <span className="font-medium">{user?.fullName || "User"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Photo Preview Modal - Full Screen */}
      {profileImageUrl && showPhotoPreview && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
          {/* Dark backdrop - Full Screen */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onMouseEnter={handlePreviewMouseEnter}
            onClick={handleClosePreview}
          />

          {/* Big photo in center */}
          <div
            className="relative z-[9999] animate-in zoom-in-95 fade-in duration-200"
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePhotoMouseLeave}
          >
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl border-4 border-primary/30">
              {/* Close Button */}
              <button
                onClick={handleClosePreview}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={profileImageUrl}
                alt={user?.fullName || "Profile"}
                className="max-w-[70vw] max-h-[70vh] w-auto h-auto object-contain rounded-lg"
              />
              {user?.fullName && (
                <p className="text-lg font-semibold text-center mt-4 text-gray-900 dark:text-white">
                  {user.fullName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


