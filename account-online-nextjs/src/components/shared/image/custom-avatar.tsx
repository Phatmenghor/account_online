import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { useState, useRef } from "react";

interface CustomerAvatarProps {
  imageUrl: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const CustomAvatar: React.FC<CustomerAvatarProps> = ({
  imageUrl,
  name,
  size = "md",
  className = "",
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const getLogoUrl = () => {
    if (!imageUrl) return undefined;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // If no base URL, use relative path
    if (!baseUrl) return imageUrl;

    // If base URL exists, join them safely to avoid double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanImageUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

    return `${cleanBaseUrl}${cleanImageUrl}`;
  };

  const logoUrl = getLogoUrl();

  const fallbackText = name?.charAt(0)?.toUpperCase() || "B";

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // Set 1 second delay before opening
    openTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    // Clear the open timeout if user leaves before 1.5s
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }

    // Small delay before closing for smooth transition
    closeTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 100);
  };

  const handleClose = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setShowPreview(false);
  };

  const handlePreviewMouseEnter = () => {
    // Clear close timeout when hovering preview
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  return (
    <>
      <div className="relative">
        <Avatar
          className={`${sizeClasses[size]} border-2 border-background shadow-sm hover:border-primary hover:shadow-lg hover:scale-110 transition-all cursor-pointer ${className}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AvatarImage src={logoUrl} alt={name || "Avatar"} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* HUGE Photo Preview - 70% of screen */}
      {logoUrl && showPreview && (
        <>
          {/* Dark backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
            onMouseEnter={handlePreviewMouseEnter}
            onClick={handleClose}
          />

          {/* Big photo in center */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] animate-in zoom-in-95 fade-in duration-200"
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-2xl border-4 border-primary/30">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={logoUrl}
                alt={name || "Photo"}
                className="max-w-[70vw] max-h-[70vh] w-auto h-auto object-contain rounded-lg"
              />
              {name && (
                <p className="text-lg font-semibold text-center mt-4 text-gray-900 dark:text-white">
                  {name}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
