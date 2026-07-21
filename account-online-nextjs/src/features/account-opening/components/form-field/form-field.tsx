"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BaseFieldProps {
  label: string;
  disabled?: boolean;
  required?: boolean;
}

interface FormInputProps extends BaseFieldProps {
  type?: "text" | "date" | "email" | "tel" | "number";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface SelectOption {
  id: number | string;
  label: string;
  value: string;
}

interface FormSelectProps extends BaseFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  isLoading?: boolean;
  className?: string;
}

// Reusable Input Field Component
export function FormInputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="text-base font-medium text-gray-700 block mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10"
        disabled={disabled}
      />
    </div>
  );
}

// Reusable Select Field Component
export function FormSelectField({
  label,
  placeholder = "--- Choose one ---",
  value,
  onChange,
  options,
  disabled = false,
  isLoading = false,
  required = false,
  className = "",
}: FormSelectProps) {
  return (
    <div className={className}>
      <label className="text-base font-medium text-gray-700 block mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full h-10">
          <SelectValue 
            placeholder={isLoading ? "Loading..." : placeholder} 
          />
        </SelectTrigger>
        <SelectContent>
          {options.length > 0 ? (
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
    </div>
  );
}