
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  isSubmitting: boolean;
  isDirty: boolean;
  isCreate?: boolean;
  createMessage?: string;
  updateMessage?: string;
  noChangesMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFooter({
  isSubmitting,
  isDirty,
  isCreate = true,
  createMessage = "Creating...",
  updateMessage = "Updating...",
  noChangesMessage = "No changes made",
  children,
  className,
}: FormFooterProps) {
  const getStatusMessage = () => {
    if (isSubmitting) {
      return isCreate ? createMessage : updateMessage;
    }
    if (isDirty) {
      return "You have unsaved changes";
    }
    return noChangesMessage;
  };

  return (
    <div
      className={cn(
        "px-6 py-4 flex flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-100/90 flex-shrink-0 rounded-b-3xl",
        className
      )}
    >
      <div className="text-xs text-slate-400 flex items-center gap-1.5 min-w-0 flex-1">
        {isSubmitting && (
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
        )}
        {isDirty && !isSubmitting && (
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
        <span className="truncate">{getStatusMessage()}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}
