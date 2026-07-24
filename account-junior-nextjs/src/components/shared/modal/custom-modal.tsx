"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const SIZE_CLASSES = {
  xs: "sm:max-w-md",
  sm: "sm:max-w-md",
  default: "sm:max-w-lg",
  md: "sm:max-w-lg",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-lg",
  "2xl": "sm:max-w-lg",
  "3xl": "sm:max-w-lg",
  "4xl": "sm:max-w-lg",
  "5xl": "sm:max-w-lg",
  "6xl": "sm:max-w-lg",
  full: "sm:max-w-lg",
};

export type ModalSize = keyof typeof SIZE_CLASSES;

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  hideCloseButton?: boolean;
  disableScrollWrapper?: boolean;
}

export function CustomModal({
  isOpen,
  onClose,
  children,
  size = "default",
  className,
  hideCloseButton = false,
  disableScrollWrapper = false,
}: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("w-full max-h-[92vh] p-0 flex flex-col", SIZE_CLASSES[size], className)}
        closeButtonClassName={hideCloseButton ? "hidden" : ""}
        disableScrollWrapper={disableScrollWrapper}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
