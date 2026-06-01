export const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    DEVELOPER: "Developer",
    BUSINESS: "Business",
    COMPLIANCE: "Compliance",
    STAFF: "Staff",
    USER: "User",
  };
  return roleMap[role?.toUpperCase()] || role;
};
