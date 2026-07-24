import { Role } from "../display-list/enum/user";

export const ROLE_FILTER = [
  { value: Role.DEVELOPER, label: "Developer" },
  { value: Role.BUSINESS, label: "Business" },
  { value: Role.COMPLIANCE, label: "Compliance" },
  { value: Role.STAFF, label: "Staff" },
  { value: Role.CALLCENTER, label: "Call Center" },
];

export const ROLE_FILTER_WITH_ALL = [
  { value: "ALL", label: "All Roles" },
  ...ROLE_FILTER,
];
