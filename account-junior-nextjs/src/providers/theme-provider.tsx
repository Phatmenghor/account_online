"use client";

import * as React from "react";

// Theme is light-only — ThemeProvider is a passthrough wrapper.
interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
