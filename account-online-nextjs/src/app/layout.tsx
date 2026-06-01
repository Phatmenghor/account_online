import type { Metadata } from "next";
import { getMessages, getLocale } from "next-intl/server";
import PageProgressBar from "@/components/shared/progressbar/Nprogressbar/global-n-progress";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { type Locale } from "@/i18n/request";
import { LocaleProvider } from "@/context/provider/local-provider";
import { ClientProviders } from "@/context/provider/client-provider";

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
  title: "Account Online",
  description: "Account Online application",
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
    <html lang={serverLocale} className={kantumruyPro.variable}>
      <head>
        <link rel="icon" href="/assets/cp.png" />
      </head>
      <body className="font-kantumruy antialiased">
        <LocaleProvider
          initialLocale={serverLocale}
          initialMessages={serverMessages}
        >
          <ClientProviders>
            <PageProgressBar />
            {children}
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
