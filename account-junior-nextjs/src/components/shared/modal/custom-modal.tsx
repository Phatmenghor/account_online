"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  closeButtonClassName?: string;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  full: "sm:max-w-4xl",
};

export function CustomModal({
  isOpen,
  onClose,
  children,
  className,
  size = "md",
  closeButtonClassName = "hidden",
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "bg-white rounded-3xl sm:rounded-3xl border-0 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]",
          sizeClasses[size],
          className
        )}
        closeButtonClassName={closeButtonClassName}
        disableScrollWrapper
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function CustomModalHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 bg-white flex items-center justify-between shrink-0 border-b border-slate-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CustomModalBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 flex-1 overflow-y-auto space-y-4 text-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CustomModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 pt-5 pb-6 bg-slate-100/90 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 shrink-0 rounded-b-3xl border-t border-slate-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
