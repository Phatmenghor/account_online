import { UserPermission } from "@/constants/AppResource/display-list/enum/user";

export const permissionPriority: Record<UserPermission, number> = {
  [UserPermission.NORMAL]: 2,
  [UserPermission.APPROVED]: 1,
};

/**
 * Can currentPermission perform actions allowed for targetMinRole?
 */
export function canPerformGeneralAction(
  currentPermission: UserPermission,
  targetPermission: UserPermission
): boolean {
  return (
    permissionPriority[currentPermission] >=
    permissionPriority[targetPermission]
  );
}

/**
 * Can currentPermission modify the targetRole?
 * (e.g. DEV > ADMIN, ADMIN > USER, but ADMIN can't > DEV)
 */
export function canPerformPrivilegedAction(
  currentPermission: UserPermission,
  targetPermission: UserPermission
): boolean {
  if (currentPermission === UserPermission.APPROVED) {
    return (
      permissionPriority[currentPermission] >
      permissionPriority[targetPermission]
    );
  }
  return (
    permissionPriority[currentPermission] >=
    permissionPriority[targetPermission]
  );
}
