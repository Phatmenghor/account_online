"use client";

import React, { useState } from "react";
import { Controller, FieldValues, Path, Control, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

export interface CustomFormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  type?: "text" | "password" | "email" | "tel" | "number";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CustomFormField<T extends FieldValues = FieldValues>({
  name,
  label,
  control,
  error,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  icon: Icon,
  autoComplete,
  className = "",
  inputClassName = "",
  labelClassName = "",
  onChange: customOnChange,
}: CustomFormFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {label && (
        <Label htmlFor={String(name)} className={cn("text-xs font-semibold text-gray-700 block", labelClassName)}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="relative">
            {Icon && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            )}
            <Input
              {...field}
              value={field.value ?? ""}
              id={String(name)}
              type={inputType}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete || (isPassword ? "new-password" : "off")}
              onChange={(e) => {
                field.onChange(e);
                customOnChange?.(e);
              }}
              className={cn(
                "h-9.5 text-xs sm:text-sm rounded-xl transition-all",
                Icon && "pl-9",
                isPassword && "pr-9",
                error ? "border-red-400 focus-visible:ring-red-300 bg-red-50/20" : "",
                inputClassName
              )}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        )}
      />
      {error?.message && (
        <p className="text-xs text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
}
