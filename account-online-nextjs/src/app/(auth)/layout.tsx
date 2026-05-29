// src/app/(auth)/layout.tsx
import { Loader2 } from "lucide-react";
import { ReactNode, Suspense } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Suspense fallback={<AuthLoading />}>
      {children}
    </Suspense>
  );
}

function AuthLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
