"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BaseFieldProps {
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export interface FormInputProps extends BaseFieldProps {
  type?: "text" | "date" | "email" | "tel" | "number" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}

export interface SelectOption {
  id: number | string;
  label: string;
  value: string;
}

export interface FormSelectProps extends BaseFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  isLoading?: boolean;
  triggerClassName?: string;
}

// Reusable Custom Input Field Component
export function FormInputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = "",
  inputClassName = "",
}: FormInputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 block">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-9 text-sm rounded-xl ${inputClassName}`}
        disabled={disabled}
      />
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}

// Reusable Custom Select Field Component
export function FormSelectField({
  label,
  placeholder = "--- Choose one ---",
  value,
  onChange,
  options,
  disabled = false,
  isLoading = false,
  required = false,
  error,
  className = "",
  triggerClassName = "",
}: FormSelectProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 block">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className={`w-full h-9 text-sm rounded-xl bg-white ${triggerClassName}`}>
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options && options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-data" disabled>
              No options available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}