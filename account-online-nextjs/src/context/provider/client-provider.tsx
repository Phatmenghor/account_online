"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "@/store/store";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        expand={false}
        visibleToasts={3}
        toastOptions={{
          style: { fontSize: "14px" },
        }}
      />
    </Provider>
  );
}
