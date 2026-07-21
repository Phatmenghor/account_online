"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/local-storage/token";
import { OpenAccountContent } from "@/features/account-opening/components/open-account-content";

// Staff-assisted account opening — requires login.
export default function StaffOpenAccountPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return <OpenAccountContent isPublic={false} />;
}

