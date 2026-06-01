import { Badge } from "@/components/ui/badge";
import { Crown, User, Briefcase, Users, Building2 } from "lucide-react";
import { getRoleDisplayName } from "@/utils/role-display";

interface RoleBadgeProps {
  role: string;
}

const ROLE_CONFIG: Record<string, {
  icon: React.ElementType;
  className: string;
}> = {
  DEVELOPER: {
    icon: Crown,
    className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
  BUSINESS: {
    icon: Briefcase,
    className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  COMPLIANCE: {
    icon: Building2,
    className: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  },
  STAFF: {
    icon: Users,
    className: "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
  },
  USER: {
    icon: User,
    className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
};

const DEFAULT_CONFIG = {
  icon: User,
  className: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const config = ROLE_CONFIG[role?.toUpperCase()] ?? DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <Badge
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {getRoleDisplayName(role)}
    </Badge>
  );
};
