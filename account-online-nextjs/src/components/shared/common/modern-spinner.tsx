"use client";

import React from "react";

interface SpinnerProps {
  size?: number; // Tailwind size scale (e.g., 5 → h-5 w-5)
  color?: string; // Tailwind text color class (e.g., "text-white")
  className?: string; // Additional Tailwind classes
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 5,
  color = "text-white",
  className,
}) => {
  return (
    <svg
      className={`animate-spin h-${size} w-${size} ${color} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
};

export default Spinner;
