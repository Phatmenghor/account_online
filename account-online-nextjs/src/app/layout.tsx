import "./polyfills";
import type { Metadata, Viewport } from "next";
import { getMessages, getLocale } from "next-intl/server";
import PageProgressBar from "@/components/shared/progressbar/Nprogressbar/global-n-progress";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { type Locale } from "@/i18n/request";
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
  title: "Account Online Opening",
  description: "Account Online Opening application",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Account Online Opening",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

// Locking the viewport (no pinch-zoom, scale 1) plus 16px+ form font-sizes
// (see globals.css) is what stops iOS Safari from auto-zooming on input focus.
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
  // Get initial server-side locale and messages (always default for clean URLs)
  const serverLocale = (await getLocale()) as Locale;
  const serverMessages = await getMessages();

  return (
    <html lang={serverLocale} className={kantumruyPro.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/cp.png" />
      </head>
      <body className="font-kantumruy antialiased min-h-screen overflow-y-auto" suppressHydrationWarning>
        <LocaleProvider
          initialLocale={serverLocale}
          initialMessages={serverMessages}
        >
          <ClientProviders>
            <PageProgressBar />
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}

