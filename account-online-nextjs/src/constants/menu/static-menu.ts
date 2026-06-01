import {
  LayoutDashboard, User2, IdCard, FolderClosed,
  Calendar1, MapPin, LucideIcon,
} from "lucide-react";

export type RoleEnum = "STAFF" | "COMPLIANCE" | "BUSINESS" | "DEVELOPER";

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
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
  },
  {
    title: "Users",
    icon: User2,
    href: "/user",
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
  },
  {
    title: "Account",
    icon: IdCard,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
    children: [
{
        title: "Success Accounts",
        href: "/account-online-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
      },
      {
        title: "Report Success Account",
        href: "/report-account-online-success",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
      },
    ],
  },
  {
    title: "AML",
    icon: FolderClosed,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
    children: [
      {
        title: "Management",
        href: "/aml-management",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
      },
      {
        title: "History",
        href: "/aml-history",
        roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
      },
    ],
  },
  {
    title: "Master Data",
    icon: Calendar1,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
    children: [
      { title: "Branch", href: "/branch", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "Reference", href: "/reference", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "Marital", href: "/marital", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "Occupation", href: "/occupation", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "Legal Type", href: "/legal-type", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
    ],
  },
  {
    title: "Location",
    icon: MapPin,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"],
    children: [
      { title: "Province", href: "/province", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "District", href: "/district", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "Commune", href: "/commune", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
      { title: "Village", href: "/village", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER"] },
    ],
  },
];
