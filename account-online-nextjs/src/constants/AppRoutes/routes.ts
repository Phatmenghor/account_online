import { Calendar, Code, Dock, User2 } from "lucide-react";

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_EMAIL: "/verify-email",
  },
  DASHBOARD: {
    INDEX: "/dashboard",
    USER: "/user",
    PROFILE: "/profile",
    STATIC: {
      MARITAL: "/marital",
      OCCUPATION: "/occupation",
      REFERENCE: "/reference",
      BRANCH: "/branch",
      PROVINCE: "/province",
      DISTRICT: "/district",
      COMMUNE: "/commune",
      VILLAGE: "/village",
      LEGAL_TYPE: "/legal-type",
      ACCOUNT_ONLINE_SUCCESS: "/account-online-success",
      ACCOUNT_ONLINE_SUCCESS_REPORT: "/report-account-online-success",
    },
    AML: {
      MANAGEMENT: "/aml-management",
      HISTORY: "/aml-history",
    },
    MENU_CONFIG: "/menu-config"
  },
};

export const navItems = [
  {
    title: "Users",
    href: ROUTES.DASHBOARD.INDEX,
    icon: User2,
  },
];
