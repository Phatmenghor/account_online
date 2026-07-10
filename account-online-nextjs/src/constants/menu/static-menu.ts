import {
  LayoutDashboard, User2, IdCard, FolderClosed,
  Calendar1, MapPin, LucideIcon,
} from "lucide-react";

export type RoleEnum = "STAFF" | "COMPLIANCE" | "BUSINESS" | "DEVELOPER" | "CALLCENTER";

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
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
  },
  {
    title: "Users",
    icon: User2,
    href: "/user",
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
  },
  {
    title: "Account",
    icon: IdCard,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
{
        title: "Success Accounts",
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
    title: "Master Data",
    icon: Calendar1,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      { title: "Branch", href: "/branch", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "Reference", href: "/reference", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "Marital", href: "/marital", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "Occupation", href: "/occupation", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "Legal Type", href: "/legal-type", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
    ],
  },
  {
    title: "Location",
    icon: MapPin,
    roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"],
    children: [
      { title: "Province", href: "/province", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "District", href: "/district", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "Commune", href: "/commune", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
      { title: "Village", href: "/village", roles: ["COMPLIANCE", "BUSINESS", "DEVELOPER", "CALLCENTER"] },
    ],
  },
];
