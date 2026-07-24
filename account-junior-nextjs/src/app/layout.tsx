import type { Metadata, Viewport } from "next";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { defaultLocale, type Locale } from "@/i18n/request";
import { LocaleProvider } from "@/providers/local-provider";
import { ClientProviders } from "@/providers/client-provider";
import { Suspense } from "react";

// Define Kantumruy Pro font
const kantumruyPro = localFont({
  src: [
    {
      path: "../../public/fonts/KantumruyPro/KantumruyPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/KantumruyPro/KantumruyPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/KantumruyPro/KantumruyPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/KantumruyPro/KantumruyPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-kantumruy",
});

export const metadata: Metadata = {
  title: "CPBank Junior Account Opening",
  description: "Digital bank account opening for minors and students",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CPBank Junior Account Opening",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // i18n/request.ts always uses defaultLocale — no intl middleware needed
  const serverLocale: Locale = defaultLocale;
  const serverMessages = await getMessages();

  return (
    <html lang={serverLocale} className={kantumruyPro.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/cp.png" />
      </head>
      <body
        className="font-kantumruy antialiased min-h-screen overflow-y-auto bg-white text-slate-900"
        suppressHydrationWarning
      >
        <LocaleProvider
          initialLocale={serverLocale}
          initialMessages={serverMessages}
        >
          <ClientProviders>
            <Suspense fallback={null}>{children}</Suspense>
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
