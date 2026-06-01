import {
  LayoutDashboard, User2, IdCard, FolderClosed,
  Calendar1, MapPin, LucideIcon,
} from "lucide-react";

export type RoleEnum = "STAFF" | "COMPLIANCE" | "BUSINESS" | "DEVELOPER" | "ADMIN";

export interface StaticMenuItem {
  title: string;
  icon?: LucideIcon;
  href?: string;
  roles: RoleEnum[];
  children?: StaticMenuItem[];
}

export const STATIC_MENU: StaticMenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
  },
  {
    title: "Users",
    icon: User2,
    href: "/user",
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
  },
  {
    title: "Account",
    icon: IdCard,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
    children: [
      {
        title: "Account Final",
        href: "/account-online",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
      {
        title: "Pending Review",
        href: "/pending-review",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
      {
        title: "Success Accounts",
        href: "/account-online-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
      {
        title: "Review History",
        href: "/review-history",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
      {
        title: "Report Success Account",
        href: "/report-account-online-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
    ],
  },
  {
    title: "AML",
    icon: FolderClosed,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
    children: [
      {
        title: "Management",
        href: "/aml-management",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
      {
        title: "History",
        href: "/aml-history",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
      },
    ],
  },
  {
    title: "Master Data",
    icon: Calendar1,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
    children: [
      { title: "Branch", href: "/branch", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "Reference", href: "/reference", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "Marital", href: "/marital", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "Occupation", href: "/occupation", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "Legal Type", href: "/legal-type", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
    ],
  },
  {
    title: "Location",
    icon: MapPin,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"],
    children: [
      { title: "Province", href: "/province", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "District", href: "/district", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "Commune", href: "/commune", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
      { title: "Village", href: "/village", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "ADMIN"] },
    ],
  },
];
