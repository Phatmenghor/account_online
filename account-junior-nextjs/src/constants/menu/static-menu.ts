import {
  LayoutDashboard,
  User2,
  IdCard,
  FolderClosed,
  Building,
  Baby,
  UserCheck,
  MapPin,
} from "lucide-react";

export type RoleEnum =
  | "STAFF"
  | "COMPLIANCE"
  | "BUSINESS"
  | "DEVELOPER"
  | "CALLCENTER";

export interface StaticMenuItem {
  title: string;
  icon?: any;
  href?: string;
  roles: RoleEnum[];
  children?: StaticMenuItem[];
}

export const STATIC_MENU: StaticMenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
  },
  {
    title: "Staff Account Opening",
    icon: UserCheck,
    href: "/staff/opening",
    roles: ["STAFF"],
  },
  {
    title: "Users",
    icon: User2,
    href: "/user",
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
  },
  {
    title: "Account Online",
    icon: IdCard,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      {
        title: "Account Online Success",
        href: "/account-online-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Report Success Account",
        href: "/report-account-online-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
    ],
  },
  {
    title: "Junior Account",
    icon: Baby,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      {
        title: "Junior Success Accounts",
        href: "/junior-account-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Report Junior Account",
        href: "/report-junior-account-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
    ],
  },
  {
    title: "Junior AML",
    icon: FolderClosed,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      {
        title: "Management",
        href: "/junior-aml-management",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "History",
        href: "/junior-aml-history",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
    ],
  },
  {
    title: "AML",
    icon: FolderClosed,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      {
        title: "Management",
        href: "/aml-management",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "History",
        href: "/aml-history",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
    ],
  },
  {
    title: "Location",
    icon: MapPin,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      {
        title: "Province",
        href: "/province",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "District",
        href: "/district",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Commune",
        href: "/commune",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Village",
        href: "/village",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
    ],
  },
  {
    title: "Master Data",
    icon: Building,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      {
        title: "Branch",
        href: "/branch",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Marital",
        href: "/marital",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Occupation",
        href: "/occupation",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
      {
        title: "Reference",
        href: "/reference",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
      },
    ],
  },
];
