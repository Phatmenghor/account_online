export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    DEVELOPER: "Developer",
    BUSINESS: "Business",
    COMPLIANCE: "Compliance",
    STAFF: "Staff",
    CALLCENTER: "Call Center",
  };
  return roleMap[role?.toUpperCase()] || role;
};
