"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  locales,
  defaultLocale,
  type Locale,
  normalizeLocale,
} from "@/i18n/request";

// ---------------- Context ----------------
interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: any;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// ---------------- Helpers ----------------
function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  try {
    // localStorage
    const stored = localStorage.getItem("locale");
    if (stored && locales.includes(normalizeLocale(stored) as Locale)) {
      return normalizeLocale(stored);
    }

    // cookies
    const cookieMatch = document.cookie.match(/locale=([^;]+)/);
    if (
      cookieMatch &&
      locales.includes(normalizeLocale(cookieMatch[1]) as Locale)
    ) {
      return normalizeLocale(cookieMatch[1]);
    }
  } catch (error) {
    console.log("Could not read stored locale:", error);
  }

  return defaultLocale;
}

function storeLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  localStorage.setItem("locale", locale);
  document.cookie = `locale=${locale}; path=/; max-age=${
    365 * 24 * 60 * 60
  }; SameSite=Lax`;
}

// ---------------- Provider ----------------
interface LocaleProviderProps {
  children: ReactNode;
  initialMessages: any;
  initialLocale: Locale;
}

export function LocaleProvider({
  children,
  initialMessages,
  initialLocale,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  // On mount, check for stored locale
  useEffect(() => {
    const storedLocale = getStoredLocale();
    if (storedLocale !== locale) {
      loadLocale(storedLocale);
    }
  }, []);

  // Dynamically load messages
  const loadLocale = async (newLocale: Locale) => {
    if (newLocale === locale && messages) return;

    setIsLoading(true);
    try {
      const normalized = normalizeLocale(newLocale);
      const newMessages = (await import(`../messages/${normalized}.json`))
        .default;

      setMessages(newMessages);
      setLocaleState(normalized);
      storeLocale(normalized);

      console.log("Client-side locale loaded:", normalized);
    } catch (error) {
      console.error("Failed to load locale:", newLocale, error);

      // fallback
      if (newLocale !== defaultLocale) {
        try {
          const fallbackMessages = (
            await import(`../messages/${defaultLocale}.json`)
          ).default;
          setMessages(fallbackMessages);
          setLocaleState(defaultLocale);
          storeLocale(defaultLocale);
        } catch (fallbackError) {
          console.error("Also failed to load fallback locale:", fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setLocale = (newLocale: Locale) => {
    if (newLocale !== locale) {
      loadLocale(newLocale);
    }
  };

  const contextValue: LocaleContextType = {
    locale,
    setLocale,
    messages,
    isLoading,
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider
        messages={messages}
        locale={locale}
        timeZone="Asia/Phnom_Penh"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

// ---------------- Hook ----------------
export function useClientLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useClientLocale must be used within a LocaleProvider");
  }
  return context;
}
