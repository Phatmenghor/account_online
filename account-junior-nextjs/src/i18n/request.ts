import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "kh"] as const;
export const defaultLocale = "kh" as const;
export type Locale = (typeof locales)[number];

/**
 * Normalize locale codes so "zh-CN" -> "zh", "en-US" -> "en", etc.
 */
export function normalizeLocale(locale: string): Locale {
  if (locale.startsWith("en")) return "en";
  if (locale.startsWith("kh")) return "kh";
  return defaultLocale;
}

export default getRequestConfig(async () => {
  // Server always uses defaultLocale for initial render (clean URLs)
  const rawLocale: string = defaultLocale;
  const locale = normalizeLocale(rawLocale);

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      messages,
      locale,
      timeZone: "Asia/Phnom_Penh", // Cambodia timezone
    };
  } catch (error) {
    console.error("Failed to load messages for locale:", locale, error);
    return {
      locale: defaultLocale,
      messages: {},
      timeZone: "Asia/Phnom_Penh",
    };
  }
});
