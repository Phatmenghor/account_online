import { OpenAccountContent } from "@/features/account-opening/components/open-account-content";

// Staff-assisted account opening — protected by middleware at edge
export default function StaffOpenAccountPage() {
  return <OpenAccountContent isPublic={false} />;
}

