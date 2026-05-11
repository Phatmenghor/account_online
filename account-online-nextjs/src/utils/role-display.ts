/**
 * Maps backend role values to display labels
 * This allows us to show different labels on the UI while keeping the backend values unchanged
 */
export const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
        BUSINESS: "Business",
        COMPLIANCE: "Compliance",
        ADMIN: "Admin",
        USER: "User",
        DEVELOPER: "Developer",
    };

    return roleMap[role] || role;
};
