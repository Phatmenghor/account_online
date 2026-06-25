"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonIcon?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  variant?: "danger" | "warning" | "info" | "orange"; // ✅ added "orange"
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showIcon?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant,
  confirmButtonIcon,
  className,
  size = "md",
  showIcon = true,
}: CustomDialogProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isConfirmLoading) onClose();
    };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose, isConfirmLoading]);

  const handleConfirm = async () => {
    try {
      setIsConfirmLoading(true);
      const result = onConfirm();
      if (result instanceof Promise) await result;
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  if (!isMounted) return null;

  // ✅ Added orange color variant here
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          confirmButtonClass: "bg-red-500 hover:bg-red-600 text-white",
          title: "text-red-500",
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-6 w-6 text-yellow-500" />,
          confirmButtonClass: "bg-yellow-500 hover:bg-yellow-600 text-white",
          title: "text-yellow-500",
        };
      case "orange":
        return {
          icon: <AlertCircle className="h-6 w-6 text-orange-500" />,
          confirmButtonClass: "bg-orange-500 hover:bg-orange-600 text-white",
          title: "text-red-500",
        };
      case "info":

      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-500" />,
          confirmButtonClass: "bg-orange-500 hover:bg-orange-600 text-white",
          title: "text-red-500",
        };
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "max-w-[400px]";
      case "md":
        return "max-w-[480px]";
      case "lg":
        return "max-w-[560px]";
      case "xl":
        return "max-w-[720px]";
      case "full":
        return "max-w-[95vw] min-h-[95vh] md:max-w-[90vw] md:max-h-[90vh]";
      default:
        return "max-w-[480px]";
    }
  };

  const variantStyles = getVariantStyles();
  const sizeClass = getSizeClass();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={!isConfirmLoading ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.2,
              }}
              className={cn(
                "bg-background relative overflow-hidden rounded-lg shadow-xl w-full",
                sizeClass,
                className
              )}
              onClick={(e: any) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={!isConfirmLoading ? onClose : undefined}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Close dialog"
                disabled={isConfirmLoading}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {showIcon && (
                    <div className="flex-shrink-0 mt-0.5">
                      {variantStyles.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2
                      className={cn(
                        "text-xl font-semibold mb-2",
                        variantStyles.title
                      )}
                    >
                      {title}
                    </h2>
                    {description && (
                      <p className="text-muted-foreground mb-6">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="mt-3 sm:mt-0"
                    disabled={isConfirmLoading}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isConfirmLoading}
                    className={cn(
                      variantStyles.confirmButtonClass,
                      "min-w-[110px]"
                    )}
                  >
                    {isConfirmLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {confirmLabel}...
                      </>
                    ) : (
                      <>
                        {confirmButtonIcon && (
                          <span className="mr-2">{confirmButtonIcon}</span>
                        )}
                        {confirmLabel}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
