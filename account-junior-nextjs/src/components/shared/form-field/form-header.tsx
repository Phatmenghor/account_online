"use client";

import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Plus, Edit, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormHeaderVariant = "default" | "destructive";

interface FormHeaderProps {
  title: string;
  description?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  showAvatar?: boolean;
  isCreate?: boolean;
  icon?: LucideIcon;
  variant?: FormHeaderVariant;
  className?: string;
}

export function FormHeader({
  title,
  description,
  avatarName,
  avatarImageUrl,
  showAvatar = false,
  isCreate = true,
  icon,
  variant = "default",
  className,
}: FormHeaderProps) {
  const Icon = icon ?? (isCreate ? Plus : Edit);

  const isDestructive = variant === "destructive";
  const iconBoxClass = isDestructive
    ? "bg-red-50 border border-red-200 text-red-600"
    : "bg-primary/10 border border-primary/20 text-primary";

  return (
    <DialogHeader
      className={cn(
        "px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {showAvatar ? (
          <CustomAvatar size="xl" name={avatarName} imageUrl={avatarImageUrl} />
        ) : (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              iconBoxClass,
            )}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={2.25}
            />
          </div>
        )}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-6">
          <DialogTitle className="text-base font-bold leading-tight text-slate-900 tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-slate-500 leading-snug">
              {description}
            </DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
