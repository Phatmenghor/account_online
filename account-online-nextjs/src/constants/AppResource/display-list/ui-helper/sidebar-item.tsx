"use client";

import { ROUTES } from "@/constants/AppRoutes/routes";
import {
  Calendar1Icon,
  File,
  FolderClosed,
  IdCard,
  LayoutDashboard,
  User2,
  MapPin,
} from "lucide-react";

export function useNavItems() {
  return [
    {
      title: "Dashboard",
      href: ROUTES.DASHBOARD.INDEX,
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: ROUTES.DASHBOARD.USER,
      icon: User2,
    },
    {
      title: "Account Final",
      href: ROUTES.DASHBOARD.ACCOUNT_ONLINE,
      icon: IdCard,
    },
    {
      title: "Success Accounts",
      href: ROUTES.DASHBOARD.STATIC.ACCOUNT_ONLINE_SUCCESS,
      icon: IdCard,
    },
    {
      title: "AML",
      href: "#",
      icon: FolderClosed,
      subItems: [
        { title: "Management", href: ROUTES.DASHBOARD.AML.MANAGEMENT },
        { title: "History", href: ROUTES.DASHBOARD.AML.HISTORY },
      ],
    },
    {
      title: "Master Data",
      href: "#",
      icon: Calendar1Icon,
      subItems: [
        {
          title: "Branch",
          href: ROUTES.DASHBOARD.STATIC.BRANCH,
        },
        {
          title: "Reference",
          href: ROUTES.DASHBOARD.STATIC.REFERENCE,
        },
        { title: "Marital", href: ROUTES.DASHBOARD.STATIC.MARITAL },
        { title: "Occupation", href: ROUTES.DASHBOARD.STATIC.OCCUPATION },
        { title: "Legal Type", href: ROUTES.DASHBOARD.STATIC.LEGAL_TYPE },
      ],
    },
    {
      title: "Location",
      href: "#",
      icon: MapPin,
      subItems: [
        {
          title: "Province",
          href: ROUTES.DASHBOARD.STATIC.PROVINCE,
        },
        { title: "District", href: ROUTES.DASHBOARD.STATIC.DISTRICT },
        { title: "Commune", href: ROUTES.DASHBOARD.STATIC.COMMUNE },
        { title: "Village", href: ROUTES.DASHBOARD.STATIC.VILLAGE },
      ],
    },
    {
      title: "Report",
      href: ROUTES.DASHBOARD.REPORT,
      icon: File,
    },
  ];
}
