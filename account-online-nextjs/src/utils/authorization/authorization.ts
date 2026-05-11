//EXample Roles
export enum UserRole {
  DEVELOPER = "DEVELOPER",
  BUSINESS = "BUSINESS",
  ADMIN = "ADMIN",
}

export const rolePriority: Record<UserRole, number> = {
  [UserRole.DEVELOPER]: 3,
  [UserRole.BUSINESS]: 2,
  [UserRole.ADMIN]: 1,
};

/**
 * Can currentRole perform actions allowed for targetMinRole?
 */
export function canPerformGeneralAction(
  currentRole: UserRole,
  targetRole: UserRole,
): boolean {
  return rolePriority[currentRole] >= rolePriority[targetRole];
}

/**
 * Can currentRole modify the targetRole?
 * (e.g. DEV > ADMIN, ADMIN > USER, but ADMIN can't > DEV)
 */
export function canPerformPrivilegedAction(
  currentRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (currentRole === UserRole.DEVELOPER) {
    return rolePriority[currentRole] > rolePriority[targetRole];
  }
  return rolePriority[currentRole] >= rolePriority[targetRole];
}
